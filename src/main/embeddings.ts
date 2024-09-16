import {
  Note,
  FileNode,
  DirectoryStructures,
  Embedding,
  SimilarNote,
} from "@/shared/types";
import { ipcMain } from "electron";
import OpenAI from "openai";
import fs from "fs/promises";
import path from "path";
import { parse } from "node-html-parser";
import { getOpenAIKey } from "./fileSystem";

const TEXT_EMBEDDING_MODEL = "text-embedding-ada-002";

class EmbeddingCreator {
  private openai: OpenAI;

  constructor(openai: OpenAI) {
    this.openai = openai;
  }

  async createEmbedding(content: string): Promise<Embedding> {
    return await this.openai.embeddings.create({
      model: TEXT_EMBEDDING_MODEL,
      input: content,
    });
  }

  async parseNoteForEmbedding(note: Note): Promise<string> {
    const root = parse(note.content);
    const textContent = root.textContent.trim();
    return `${note.title}\n\n${textContent}`;
  }

  async saveEmbedding(embedding: Embedding, filePath: string): Promise<void> {
    const embeddingDirPath = path.dirname(filePath);
    await fs.mkdir(embeddingDirPath, { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(embedding));
  }
}

class SimilaritySearcher {
  async findEmbeddingPaths(
    directoryStructures: DirectoryStructures
  ): Promise<string[]> {
    const embeddingPaths: string[] = [];

    const traverseStructure = async (fileNode: FileNode) => {
      if (fileNode.type === "note" && fileNode.noteMetadata) {
        const embeddingPath = `${path.dirname(fileNode.fullPath)}/${
          fileNode.noteMetadata.id
        }.embedding.json`;
        try {
          await fs.access(embeddingPath);
          embeddingPaths.push(embeddingPath);
        } catch (error) {
          // Embedding file doesn't exist, skip
        }
      }
      if (fileNode.childIds) {
        for (const childId of fileNode.childIds) {
          const childNode = directoryStructures.nodes[childId];
          if (childNode) {
            await traverseStructure(childNode);
          }
        }
      }
    };

    for (const rootId of directoryStructures.rootIds) {
      const rootNode = directoryStructures.nodes[rootId];
      if (rootNode) {
        await traverseStructure(rootNode);
      }
    }

    return embeddingPaths;
  }

  async performSimilaritySearch(
    queryEmbedding: OpenAI.Embeddings.CreateEmbeddingResponse,
    embeddingPaths: string[]
  ): Promise<SimilarNote[]> {
    const results: SimilarNote[] = [];

    for (const embeddingPath of embeddingPaths) {
      const embeddingContent = await fs.readFile(embeddingPath, "utf-8");
      const embedding = JSON.parse(embeddingContent) as Embedding;
      const score = this.cosineSimilarity(
        queryEmbedding.data[0].embedding,
        embedding.data[0].embedding
      );
      const notePath = embeddingPath.replace(".embedding.json", ".json");
      const noteContent = await fs.readFile(notePath, "utf-8");
      const note = JSON.parse(noteContent) as SimilarNote;

      results.push({ ...note, score });
    }

    return results.sort((a, b) => b.score - a.score).slice(0, 5); // Return top 5 results
  }

  cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, _, i) => sum + a[i] * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }
}

export const setupEmbeddingService = async (): Promise<void> => {
  const openaiApiKey = await getOpenAIKey();
  const openai = new OpenAI({ apiKey: openaiApiKey });
  const embeddingCreator = new EmbeddingCreator(openai);
  const similaritySearcher = new SimilaritySearcher();

  ipcMain.handle(
    "generate-note-embeddings",
    async (_, note: Note, fileNode: FileNode): Promise<Embedding> => {
      try {
        const parsedContent = await embeddingCreator.parseNoteForEmbedding(note);
        const embedding = await embeddingCreator.createEmbedding(parsedContent);
        const embeddingFullPath = path.join(
          path.dirname(fileNode.fullPath),
          `${note.id}.embedding.json`
        );
        await embeddingCreator.saveEmbedding(embedding, embeddingFullPath);
        return embedding;
      } catch (error) {
        console.error("Error generating note embeddings:", error);
        throw error;
      }
    }
  );

  ipcMain.handle(
    "perform-similarity-search",
    async (
      _,
      query: string,
      directoryStructures: DirectoryStructures
    ): Promise<SimilarNote[]> => {
      try {
        const queryEmbedding = await embeddingCreator.createEmbedding(query);
        const embeddingPaths = await similaritySearcher.findEmbeddingPaths(
          directoryStructures
        );
        return await similaritySearcher.performSimilaritySearch(
          queryEmbedding,
          embeddingPaths
        );
      } catch (error) {
        console.error("Error performing similarity search:", error);
        throw error;
      }
    }
  );
};
