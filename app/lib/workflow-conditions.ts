import prisma from '@/lib/prisma';
import { ConditionType } from '../types/workflow';

export async function evaluateCondition(conditionData: any, leadId: string): Promise<boolean> {
  const { type } = conditionData;
  
  try {
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: {
        emailConversation: {
          orderBy: { sentAt: 'desc' },
          take: 1
        }
      }
    });
    
    if (!lead) {
      throw new Error(`Lead with ID ${leadId} not found`);
    }
    
    // Evaluate based on condition type
    switch (type) {
      case ConditionType.LEAD_PROPERTY:
        return evaluateLeadProperty(conditionData, lead);
        
      case ConditionType.EMAIL_PROPERTY:
        return evaluateEmailProperty(conditionData, lead.emailConversation[0]);
        
      case ConditionType.DATE_COMPARISON:
        return evaluateDateComparison(conditionData, lead);
        
      case ConditionType.CUSTOM_FIELD:
        return evaluateCustomField(conditionData, lead);
        
      default:
        throw new Error(`Unknown condition type: ${type}`);
    }
  } catch (error) {
    console.error(`Error evaluating condition ${type}:`, error);
    return false; // Default to false on error
  }
}

// Evaluate a condition on a lead property
function evaluateLeadProperty(data: any, lead: any): boolean {
  const { property, operator, value } = data;
  
  if (!property || !operator) {
    console.error('Missing property or operator in condition', data);
    return false;
  }
  
  const leadValue = lead[property];
  
  switch (operator) {
    case 'equals':
      return leadValue === value;
    case 'notEquals':
      return leadValue !== value;
    case 'contains':
      return typeof leadValue === 'string' && leadValue.includes(value);
    case 'notContains':
      return typeof leadValue === 'string' && !leadValue.includes(value);
    case 'greaterThan':
      return Number(leadValue) > Number(value);
    case 'lessThan':
      return Number(leadValue) < Number(value);
    case 'isSet':
      return leadValue !== null && leadValue !== undefined;
    case 'isNotSet':
      return leadValue === null || leadValue === undefined;
    default:
      console.error(`Unknown operator: ${operator}`);
      return false;
  }
}

// Evaluate a condition on the most recent email
function evaluateEmailProperty(data: any, email: any): boolean {
  if (!email) return false;
  
  const { property, operator, value } = data;
  
  if (!property || !operator) {
    console.error('Missing property or operator in condition', data);
    return false;
  }
  
  const emailValue = email[property];
  
  switch (operator) {
    case 'equals':
      return emailValue === value;
    case 'notEquals':
      return emailValue !== value;
    case 'contains':
      return typeof emailValue === 'string' && emailValue.includes(value);
    case 'notContains':
      return typeof emailValue === 'string' && !emailValue.includes(value);
    case 'hasSubject':
      return typeof email.subject === 'string' && email.subject.includes(value);
    case 'hasBody':
      return typeof email.body === 'string' && email.body.includes(value);
    case 'isOpened':
      return email.opened === true;
    case 'isNotOpened':
      return email.opened !== true;
    default:
      console.error(`Unknown operator: ${operator}`);
      return false;
  }
}

// Evaluate a date comparison condition
function evaluateDateComparison(data: any, lead: any): boolean {
  const { dateField, operator, value, unit } = data;
  
  if (!dateField || !operator) {
    console.error('Missing dateField or operator in condition', data);
    return false;
  }
  
  const leadDate = lead[dateField];
  if (!leadDate) return false;
  
  const leadDateTime = new Date(leadDate).getTime();
  const now = Date.now();
  const diff = Math.abs(now - leadDateTime);
  
  // Convert value to milliseconds based on unit
  let valueInMs = value;
  switch (unit) {
    case 'minutes':
      valueInMs = value * 60 * 1000;
      break;
    case 'hours':
      valueInMs = value * 60 * 60 * 1000;
      break;
    case 'days':
      valueInMs = value * 24 * 60 * 60 * 1000;
      break;
    case 'weeks':
      valueInMs = value * 7 * 24 * 60 * 60 * 1000;
      break;
  }
  
  switch (operator) {
    case 'lessThan': // Less than X time ago
      return diff < valueInMs;
    case 'greaterThan': // More than X time ago
      return diff > valueInMs;
    case 'before': // Date is before now
      return leadDateTime < now;
    case 'after': // Date is after now
      return leadDateTime > now;
    default:
      console.error(`Unknown operator: ${operator}`);
      return false;
  }
}

// Evaluate a condition on a custom field
function evaluateCustomField(data: any, lead: any): boolean {
  const { fieldName, operator, value } = data;
  
  if (!fieldName || !operator) {
    console.error('Missing fieldName or operator in condition', data);
    return false;
  }
  
  if (!lead.customFields || typeof lead.customFields !== 'object') {
    return false;
  }
  
  const fieldValue = lead.customFields[fieldName];
  
  switch (operator) {
    case 'equals':
      return fieldValue === value;
    case 'notEquals':
      return fieldValue !== value;
    case 'contains':
      return typeof fieldValue === 'string' && fieldValue.includes(value);
    case 'notContains':
      return typeof fieldValue === 'string' && !fieldValue.includes(value);
    case 'greaterThan':
      return Number(fieldValue) > Number(value);
    case 'lessThan':
      return Number(fieldValue) < Number(value);
    case 'isSet':
      return fieldValue !== null && fieldValue !== undefined;
    case 'isNotSet':
      return fieldValue === null || fieldValue === undefined;
    default:
      console.error(`Unknown operator: ${operator}`);
      return false;
  }
} 