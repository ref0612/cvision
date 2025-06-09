'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { analyzeFinancialData, AnalyzeFinancialDataOutput } from '@/ai/flows/analyze-financial-data';
import { Sparkles, AlertTriangle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';


export default function AiSuggestionsPage() {
  const [financialDataInput, setFinancialDataInput] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<AnalyzeFinancialDataOutput | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const result = await analyzeFinancialData({ financialData: financialDataInput });
      setAnalysisResult(result);
    } catch (err) {
      console.error("AI Analysis Error:", err);
      setError('Ocurrió un error al analizar los datos. Por favor, inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-headline font-semibold flex items-center">
        <Sparkles className="mr-3 h-8 w-8 text-primary" />
        Sugerencias Impulsadas por IA
      </h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Analizar Datos Financieros</CardTitle>
          <CardDescription>
            Ingresa un resumen de tus datos financieros (ingresos, egresos, costos de inventario, etc.) 
            para que la IA identifique patrones, oportunidades de ahorro y posibles ineficiencias.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="financialData">Datos Financieros</Label>
              <Textarea
                id="financialData"
                value={financialDataInput}
                onChange={(e) => setFinancialDataInput(e.target.value)}
                placeholder="Ej: Ingresos mensuales: $5000. Egresos: Alquiler $1000, Marketing $300, Materia Prima $1500..."
                rows={8}
                required
                disabled={isLoading}
              />
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                  Analizando...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Obtener Sugerencias
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="space-y-4">
          <Card>
            <CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader>
            <CardContent><Skeleton className="h-20 w-full" /></CardContent>
          </Card>
           <Card>
            <CardHeader><Skeleton className="h-6 w-1/3" /></CardHeader>
            <CardContent><Skeleton className="h-16 w-full" /></CardContent>
          </Card>
        </div>
      )}

      {error && (
        <Card className="border-destructive">
          <CardHeader className="flex flex-row items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <CardTitle className="text-destructive">Error en el Análisis</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
        </Card>
      )}

      {analysisResult && !isLoading && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Resumen del Análisis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Información clave:</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {analysisResult.insights.map((insight: string, index: number) => (
                      <li key={index}>{insight}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Potenciales Ahorros de Costos</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-1">
                  {analysisResult.recommendations.filter((_: any, i: number) => i % 2 === 0).map((rec: string, i: number) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Ineficiencias de Precios</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-1">
                  {analysisResult.recommendations.filter((_: any, i: number) => i % 2 !== 0).map((rec: string, i: number) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Patrones Inusuales Detectados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-2">Evaluación de Riesgo:</h4>
                  <p>{analysisResult.riskAssessment}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-accent">
            <CardHeader>
              <CardTitle className="text-accent-foreground flex items-center">
                 <Sparkles className="mr-2 h-5 w-5 text-accent" />
                Sugerencias para Mejorar Rentabilidad
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{analysisResult?.recommendations?.join('\n\n') || 'No hay sugerencias disponibles'}</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
