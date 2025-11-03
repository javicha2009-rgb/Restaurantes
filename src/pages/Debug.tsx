import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Debug = () => {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testConnection = async () => {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      // Test 1: Basic connection
      console.log('Testing Supabase connection...');
      
      // Test 2: Check if we can access bars table
      const { data: bars, error: barsError } = await supabase
        .from('bars')
        .select('*')
        .limit(5);

      if (barsError) {
        throw new Error(`Bars error: ${barsError.message}`);
      }

      // Test 3: Check if we can access tables table
      const { data: tables, error: tablesError } = await supabase
        .from('tables')
        .select('*')
        .limit(5);

      if (tablesError) {
        throw new Error(`Tables error: ${tablesError.message}`);
      }

      // Test 4: Check specific bar tables
      const barId = '6a4e514c-9de6-4d8d-ab1f-2c20d513df71';
      const { data: barTables, error: barTablesError } = await supabase
        .from('tables')
        .select('*')
        .eq('bar_id', barId)
        .eq('is_active', true);

      if (barTablesError) {
        throw new Error(`Bar tables error: ${barTablesError.message}`);
      }

      setResults({
        bars: bars || [],
        tables: tables || [],
        barTables: barTables || [],
        barId,
        success: true
      });

    } catch (err: any) {
      console.error('Debug test failed:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Supabase Connection Debug</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={testConnection} disabled={loading}>
            {loading ? 'Testing...' : 'Test Connection'}
          </Button>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <h3 className="font-semibold text-red-800">Error:</h3>
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {results && (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                <h3 className="font-semibold text-green-800">Success!</h3>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">Bars ({results.bars.length}):</h4>
                <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
                  {JSON.stringify(results.bars, null, 2)}
                </pre>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">All Tables ({results.tables.length}):</h4>
                <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
                  {JSON.stringify(results.tables, null, 2)}
                </pre>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">Bar Tables for {results.barId} ({results.barTables.length}):</h4>
                <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
                  {JSON.stringify(results.barTables, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Debug;