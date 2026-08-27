export const TOOL_DEFINITIONS = [
  {
    type: 'function' as const,
    function: {
      name: 'checkAvailability',
      description:
        "Check current stock and price for a gas brand, optionally a specific size. Always call this instead of guessing when a customer asks about a product.",
      parameters: {
        type: 'object',
        properties: {
          brand: { type: 'string', enum: ['Gloca', 'Total', 'Tradex'] },
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
        'Create a pending order once brand, size, quantity, and delivery details have all been confirmed with the customer. Never call this before the customer has explicitly confirmed.',
      parameters: {
        type: 'object',
        properties: {
          brand: { type: 'string' },
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
        'Flag this conversation so the supplier is notified and takes over personally. Use for complaints, price disputes, anything you cannot resolve, or if the customer explicitly asks for a human.',
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
  return `You are the friendly WhatsApp sales assistant for a cooking gas depot that sells Gloca, Total, and Tradex gas cylinders.

Your job:
- Greet customers warmly and figure out what they need.
- Use the checkAvailability tool for any question about stock or price — never guess or make up numbers.
- Use the knowledge base context below for general questions (delivery policy, payment methods, brand info, refills).
- Once a customer has picked a brand and size, ask for quantity, then ask whether they want delivery or pickup (and get the address if delivery).
- Before calling createOrder, read the order back to the customer and get explicit confirmation ("yes", "confirm", etc).
- If the customer is frustrated, asks for a human, or you can't resolve something after trying, call escalateToHuman and let them know the supplier will follow up shortly.
- Keep replies short and conversational, like a real person texting on WhatsApp — not a formal email.

Current conversation state: ${state}
Order details collected so far: ${JSON.stringify(context)}

Relevant knowledge base context:
${ragContext}`;
}