export const TOOL_DEFINITIONS = [
  {
    type: 'function' as const,
    function: {
      name: 'checkAvailability',
      description:
        "Check current stock and price for a gas brand, optionally a specific size. Always call this instead of guessing when a customer asks about a product. If a specific size is in stock, the conversation is handed to a human automatically.",
      parameters: {
        type: 'object',
        properties: {
          brand: { type: 'string', enum: ['Glocal', 'Total', 'Tradex'] },
          size: { type: 'string', description: "e.g. '6kg', '12.5kg'. Omit to list all sizes." },
        },
        required: ['brand'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'createOrder',
      description:
        'Do not use this to complete a sale. If the customer has chosen an in-stock brand and size, the system already hands the chat to a human. Only call this if you need to confirm that an order cannot be placed automatically.',
      parameters: {
        type: 'object',
        properties: {
          brand: { type: 'string', enum: ['Glocal', 'Total', 'Tradex'] },
          size: { type: 'string', enum: ['6kg', '12.5kg'] },
          quantity: { type: 'number' },
          deliveryType: { type: 'string', enum: ['delivery', 'pickup'] },
          address: { type: 'string', description: 'Required if deliveryType is delivery.' },
        },
        required: ['brand', 'size', 'quantity', 'deliveryType'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'escalateToHuman',
      description:
        'Flag this conversation so the supplier is notified and takes over personally. Use for complaints, price disputes, anything you cannot resolve, or if the customer explicitly asks for a human. Stock handovers for in-stock SKUs happen automatically from checkAvailability.',
      parameters: {
        type: 'object',
        properties: {
          reason: { type: 'string' },
        },
        required: ['reason'],
      },
    },
  },
];

export function buildSystemPrompt(state: string, context: Record<string, unknown>, ragContext: string): string {
  return `You are the friendly WhatsApp sales assistant for a cooking gas depot that sells Glocal, Total, and Tradex gas cylinders.

Your job:
- Greet customers warmly and figure out what they need (brand and size: 6kg or 12.5kg).
- Use the checkAvailability tool for any question about stock or price — never guess or make up numbers.
- Use the knowledge base context below for general questions (delivery policy, payment methods, brand info, refills).
- If the customer has not picked a size yet, list the sizes and whether each is YES (available) or NO (unavailable).
- If the requested brand and size is unavailable (inStock false / available false), tell the customer clearly that it is not available right now. Offer other in-stock options if the tool result includes them. Do not take an order for an unavailable product.
- If the requested brand and size is available, the system hands the chat to a human agent. Tell the customer that the product is available and that a team member will continue the conversation shortly. Do not collect payment. Do not call createOrder.
- If the customer is frustrated, asks for a human, or you can't resolve something after trying, call escalateToHuman and let them know the supplier will follow up shortly.
- Keep replies short and conversational, like a real person texting on WhatsApp — not a formal email.

Current conversation state: ${state}
Order details collected so far: ${JSON.stringify(context)}

Relevant knowledge base context:
${ragContext}`;
}
