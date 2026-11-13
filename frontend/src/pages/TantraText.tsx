import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { StickyFooterShell } from '@/components/ui/molecules/Footer';
import Breadcrumb from '@/components/ui/atoms/Breadcrumb';
import { Card, CardContent } from "@/components/ui/atoms/card";
import { ScrollArea } from "@/components/ui/molecules/scroll-area";
import { cn } from '@/lib/utils';
import useLanguage from '@/hooks/useLanguage';
import api from '@/utils/api';
import { pickBilingualDisplay, pickBilingualText } from '@/utils/localizedContent';
import { MarkdownContent } from '@/components/ui/molecules/MarkdownContent';

const TantraText = () => {
  const { id } = useParams<{ id: string }>();
  const { isTibetan, t } = useLanguage();
  const [text, setText] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchText = async () => {
      if (!id) {
        setError('No text ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await api.getTextById(id);
        setText(response);
      } catch (err: any) {
        console.error('Failed to fetch tantra text:', err);
        setError('Failed to load text');
      } finally {
        setLoading(false);
      }
    };

    fetchText();
  }, [id]);

  if (loading) {
    return (
      <StickyFooterShell>
        <main className="flex-1 pt-10 pb-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center items-center py-12">
              <div className="text-lg">Loading...</div>
            </div>
          </div>
        </main>
      </StickyFooterShell>
    );
  }

  if (error || !text) {
    return (
      <StickyFooterShell>
        <main className="flex-1 pt-10 pb-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center items-center py-12">
              <div className="text-lg text-red-600">{error || 'Text not found'}</div>
            </div>
          </div>
        </main>
      </StickyFooterShell>
    );
  }

  const firstSection = text.sections?.[0];
  const contentRaw = firstSection?.content;
  const contentDisp = pickBilingualDisplay(isTibetan, contentRaw?.tibetan, contentRaw?.english);
  const content = contentDisp.text;

  const titleText = pickBilingualText(isTibetan, text.title?.tibetan, text.title?.english);

  const breadcrumbItems = [
    { label: t('catalog'), href: '/catalog' },
    { label: t('tantra'), href: '/catalog?category=tantra' },
    { label: titleText }
  ];

  return (
    <StickyFooterShell>
      <main className="flex-1 pt-10 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-4">
            <Breadcrumb items={breadcrumbItems} showHome={false} />
          </div>

          <div className="mb-6">
            <h1
              className={cn(
                'text-4xl font-bold text-primary',
                pickBilingualDisplay(isTibetan, text.title?.tibetan, text.title?.english).scriptIsTibetan && 'tibetan'
              )}
            >
              {titleText}
            </h1>
          </div>

          <Card className="border border-kangyur-orange/10 rounded-xl shadow-sm">
            <CardContent className="p-6">
              <ScrollArea className="h-[70vh]">
                <MarkdownContent
                  value={content}
                  tibetan={contentDisp.scriptIsTibetan}
                  className="text-lg leading-relaxed pr-2 break-words"
                />
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </main>
    </StickyFooterShell>
  );
};

export default TantraText; 