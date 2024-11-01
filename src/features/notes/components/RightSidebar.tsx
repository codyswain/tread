import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/Tabs";
import RelatedNotes from "./RelatedNotes";
import ChatPane from "./ChatPane";

interface RightSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const RightSidebar: React.FC<RightSidebarProps> = ({ isOpen, onClose }) => {
  return (
    <div className="h-full flex flex-col bg-background border-l border-border">
      <Tabs defaultValue="related" className="flex flex-col h-full">
        <div className="flex justify-between items-center p-2 h-10 border-b border-border">
          <TabsList className="flex gap-4 bg-transparent">
            <TabsTrigger 
              value="related" 
              className="font-semibold text-sm px-0 data-[state=active]:bg-transparent data-[state=active]:text-foreground"
            >
              Related
            </TabsTrigger>
            <TabsTrigger 
              value="chat" 
              className="font-semibold text-sm px-0 data-[state=active]:bg-transparent data-[state=active]:text-foreground"
            >
              Chat
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="related" className="flex-grow overflow-hidden p-0">
          <RelatedNotes isOpen={isOpen} onClose={onClose} />
        </TabsContent>
        <TabsContent value="chat" className="flex-grow overflow-hidden p-0">
          <ChatPane onClose={onClose} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RightSidebar;
