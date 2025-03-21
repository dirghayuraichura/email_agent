export enum NodeType {
  TRIGGER = 'TRIGGER',
  CONDITION = 'CONDITION',
  ACTION = 'ACTION',
  DELAY = 'DELAY',
  SPLIT = 'SPLIT',
  END = 'END'
}

export enum TriggerType {
  LEAD_CREATED = 'LEAD_CREATED',
  LEAD_UPDATED = 'LEAD_UPDATED',
  EMAIL_RECEIVED = 'EMAIL_RECEIVED',
  EMAIL_OPENED = 'EMAIL_OPENED',
  EMAIL_CLICKED = 'EMAIL_CLICKED',
  MANUAL = 'MANUAL',
  SCHEDULED = 'SCHEDULED'
}

export enum ActionType {
  LEAD_CREATED = 'LEAD_CREATED',
  EMAIL_RECEIVED = 'EMAIL_RECEIVED',
  EMAIL_OPENED = 'EMAIL_OPENED',
  EMAIL_CLICKED = 'EMAIL_CLICKED',
  FORM_SUBMITTED = 'FORM_SUBMITTED',
  SEND_EMAIL = 'SEND_EMAIL',
  UPDATE_LEAD = 'UPDATE_LEAD',
  CREATE_TASK = 'CREATE_TASK',
  CREATE_APPOINTMENT = 'CREATE_APPOINTMENT',
  NOTIFY_USER = 'NOTIFY_USER',
  GENERATE_AI_CONTENT = 'GENERATE_AI_CONTENT',
  ANALYZE_EMAIL = 'ANALYZE_EMAIL',
  CATEGORIZE_LEAD = 'CATEGORIZE_LEAD',
  WAIT = 'WAIT',
  CONDITION = 'CONDITION',
  BRANCH = 'BRANCH',
  EMAIL_PROPERTY = 'EMAIL_PROPERTY',
  LEAD_PROPERTY = 'LEAD_PROPERTY'
}

export enum ConditionType {
  LEAD_PROPERTY = 'LEAD_PROPERTY',
  EMAIL_PROPERTY = 'EMAIL_PROPERTY',
  DATE_COMPARISON = 'DATE_COMPARISON',
  CUSTOM_FIELD = 'CUSTOM_FIELD',
  LEAD_CATEGORY = 'LEAD_CATEGORY'
}

export enum LeadCategory {
  HOT = 'HOT',
  WARM = 'WARM',
  COLD = 'COLD',
  NEW = 'NEW'
}

export interface WorkflowNode {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  data: TriggerNodeData | ActionNodeData | ConditionNodeData | DelayNodeData | any;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  condition?: any;
}

export interface TriggerNodeData {
  type: TriggerType;
  config: any;
  label: string;
}

export interface ActionNodeData {
  type: ActionType;
  config: any;
  label: string;
}

export interface ConditionNodeData {
  type: ConditionType;
  config: any;
  label: string;
}

export interface DelayNodeData {
  delayMs: number;
  delayType: 'FIXED' | 'RELATIVE';
  label: string;
} 