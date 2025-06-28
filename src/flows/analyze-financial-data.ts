'use server';

/**
 * @fileOverview Financial data analysis AI agent.
 *
 * - analyzeFinancialData - A function that handles the financial data analysis process.
 * - AnalyzeFinancialDataInput - The input type for the analyzeFinancialData function.
 * - AnalyzeFinancialDataOutput - The return type for the analyzeFinancialData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const AnalyzeFinancialDataInputSchema = z.object({
  financialData: z
    .string()
    .describe(
      'A string containing financial data (income, expenses, inventory costs).'
    ),
});
export type AnalyzeFinancialDataInput = z.infer<typeof AnalyzeFinancialDataInputSchema>;

const AnalyzeFinancialDataOutputSchema = z.object({
  analysisSummary: z.string().describe('A summary of the financial data analysis.'),
  potentialCostSavings: z
    .string()
    .describe('Identified potential cost-saving opportunities.'),
  pricingInefficiencies: z
    .string()
    .describe('Identified pricing inefficiencies.'),
  unusualPatterns: z.string().describe('Identified unusual patterns in the data.'),
  suggestions: z.string().describe('Suggestions to improve profitability.'),
});

export type AnalyzeFinancialDataOutput = z.infer<typeof AnalyzeFinancialDataOutputSchema>;

export async function analyzeFinancialData(input: AnalyzeFinancialDataInput): Promise<AnalyzeFinancialDataOutput> {
  return analyzeFinancialDataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeFinancialDataPrompt',
  input: {schema: AnalyzeFinancialDataInputSchema},
  output: {schema: AnalyzeFinancialDataOutputSchema},
  prompt: `You are a financial analyst. Analyze the following financial data to identify potential cost-saving opportunities, pricing inefficiencies, or unusual patterns.

Financial Data: {{{financialData}}}

Provide a summary of your analysis, identified potential cost savings, pricing inefficiencies, unusual patterns, and suggestions to improve profitability.

${JSON.stringify(AnalyzeFinancialDataOutputSchema.shape, null, 2)}`,
});

const analyzeFinancialDataFlow = ai.defineFlow(
  {
    name: 'analyzeFinancialDataFlow',
    inputSchema: AnalyzeFinancialDataInputSchema,
    outputSchema: AnalyzeFinancialDataOutputSchema,
  },
  async (input: AnalyzeFinancialDataInput) => {
    const {output} = await prompt(input);
    return output!;
  }
);
