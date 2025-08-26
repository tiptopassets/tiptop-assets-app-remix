import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';

interface Provider {
  id: string;
  name: string;
  logo?: string | null;
  asset_types?: string[] | null;
  is_active?: boolean | null;
}

interface ClickEvent {
  id: string;
  partner_name: string;
  user_id?: string | null;
  session_id?: string | null;
  created_at?: string | null;
}

interface PartnerRow {
  id: string;
  name: string;
  logo?: string | null;
  asset_types: string[];
  totalClicks: number;
  uniqueUsers: number;
  lastClick?: string | null;
}

const formatDateTime = (iso?: string | null) => {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    return d.toLocaleString();
  } catch {
    return '—';
  }
};

const PartnersSection: React.FC = () => {
  const [rows, setRows] = useState<PartnerRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch active providers
      const { data: providers, error: providersError } = await supabase
        .from('enhanced_service_providers')
        .select('id, name, logo, asset_types, is_active')
        .order('priority', { ascending: false });

      if (providersError) throw providersError;

      // Fetch click events (minimal fields)
      const { data: clicks, error: clicksError } = await supabase
        .from('partner_integration_progress')
        .select('id, partner_name, user_id, session_id, created_at')
        .order('created_at', { ascending: false });

      if (clicksError) {
        // Don't fail the section if clicks fail; just show zeros
        console.warn('PartnersSection: clicks fetch error', clicksError);
      }

      const clicksByPartner = new Map<string, ClickEvent[]>();
      (clicks || []).forEach((c) => {
        const key = c.partner_name || 'Unknown';
        if (!clicksByPartner.has(key)) clicksByPartner.set(key, []);
        clicksByPartner.get(key)!.push(c);
      });

      const computed: PartnerRow[] = (providers || []).map((p: Provider) => {
        const partnerClicks = clicksByPartner.get(p.name) || [];
        const totalClicks = partnerClicks.length;

        const uniqueSet = new Set<string>();
        let lastClick: string | null | undefined = undefined;
        partnerClicks.forEach((c) => {
          const uniq = c.user_id || c.session_id || c.id; // fallback to id
          uniqueSet.add(uniq);
          if (!lastClick || (c.created_at && c.created_at > lastClick)) {
            lastClick = c.created_at;
          }
        });

        return {
          id: p.id,
          name: p.name,
          logo: p.logo || undefined,
          asset_types: (p.asset_types || []) as string[],
          totalClicks,
          uniqueUsers: uniqueSet.size,
          lastClick: lastClick || null,
        };
      });

      setRows(computed);
    } catch (e) {
      console.error('PartnersSection: error loading data', e);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Realtime updates on partner_integration_progress
    const channel = supabase
      .channel('partners-progress-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'partner_integration_progress' }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const content = useMemo(() => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-tiptop-purple border-t-transparent rounded-full animate-spin" />
        </div>
      );
    }

    if (!rows.length) {
      return (
        <div className="text-sm text-muted-foreground py-8 text-center">No partners found.</div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Partner</TableHead>
              <TableHead>Assets</TableHead>
              <TableHead className="text-right">Total Clicks</TableHead>
              <TableHead className="text-right">Unique Users</TableHead>
              <TableHead className="text-right">Last Click</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    {r.logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={r.logo} alt={`${r.name} logo`} className="h-6 w-6 rounded-sm object-contain" loading="lazy" />
                    ) : (
                      <div className="h-6 w-6 rounded-sm bg-muted" />
                    )}
                    <span className="font-medium">{r.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1 max-w-[420px]">
                    {r.asset_types?.length ? (
                      r.asset_types.map((at) => (
                        <Badge key={at} variant="secondary">{at.replace(/_/g, ' ')}</Badge>
                      ))
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right font-medium">{r.totalClicks}</TableCell>
                <TableCell className="text-right">{r.uniqueUsers}</TableCell>
                <TableCell className="text-right text-muted-foreground">{formatDateTime(r.lastClick)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }, [loading, rows]);

  return (
    <section className="space-y-4">
      <header>
        <h2 className="text-2xl font-semibold tracking-tight">Partners</h2>
        <p className="text-sm text-muted-foreground">Overview of partners and referral engagement.</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Partner Clicks</CardTitle>
        </CardHeader>
        <CardContent>
          {content}
        </CardContent>
      </Card>
    </section>
  );
};

export default PartnersSection;
