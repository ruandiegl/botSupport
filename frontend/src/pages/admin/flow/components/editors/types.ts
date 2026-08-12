import type { Department, FlowNode, FlowValidationIssue } from "@/types";

export interface StepEditorProps {
  node: FlowNode;
  departments: Department[];
  issues: FlowValidationIssue[];
  onChange: (node: FlowNode) => void;
}

export const issueFor = (issues: FlowValidationIssue[], field: string) => issues.find((issue) => issue.field === field)?.message;

