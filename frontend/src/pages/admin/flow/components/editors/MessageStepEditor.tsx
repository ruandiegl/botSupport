import { FieldGroup } from "@/components/ui/field";
import { MessageField, NameField } from "./EditorFields";
import type { StepEditorProps } from "./types";
import { issueFor } from "./types";

export function MessageStepEditor({ node, issues, onChange }: StepEditorProps) {
  return <FieldGroup><NameField node={node} error={issueFor(issues, "name")} onChange={onChange} /><MessageField node={node} error={issueFor(issues, "content")} onChange={onChange} /></FieldGroup>;
}

