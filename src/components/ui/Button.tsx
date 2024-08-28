import styled from 'styled-components';

export const Button = styled.button`
  background-color: #007aff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #0056b3;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(0, 122, 255, 0.5);
  }

  &:active {
    background-color: #004999;
  }

  svg {
    margin-right: 5px;
  }
`;
