import { FieldGroup } from "@/components/ui/field";
import { DepartmentField } from "./DepartmentField";
import { NameField } from "./EditorFields";
import type { StepEditorProps } from "./types";
import { issueFor } from "./types";

export function RouteStepEditor({ node, departments, issues, onChange }: StepEditorProps) {
  return <FieldGroup><NameField node={node} error={issueFor(issues, "name")} onChange={onChange} /><DepartmentField node={node} departments={departments} error={issueFor(issues, "departmentId")} onChange={onChange} /></FieldGroup>;
}

