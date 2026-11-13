import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/atoms/button";
import { Input } from "@/components/ui/atoms/input";
import { Textarea } from "@/components/ui/atoms/textarea";
import { Label } from "@/components/ui/atoms/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/atoms/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/atoms/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/atoms/select";
import api from '@/utils/api';
import { toast } from 'sonner';
import useLanguage from '@/hooks/useLanguage';

interface TextFormProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'view' | 'edit';
  textId?: string;
  onSave?: (data: any) => Promise<void>;
}

export const TextForm = ({ isOpen, onClose, mode, textId, onSave }: TextFormProps) => {
  const [loading, setLoading] = useState(false);
  const [textData, setTextData] = useState<any>(null);
  const { isTibetan } = useLanguage();
  const [collatedContent, setCollatedContent] = useState<{
    collated_text?: string;
    english_translation?: string;
  } | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    category_id: '',
    id_slug: '',
    title_english: '',
    title_tibetan: '',
    title_sanskrit: '',
    title_chinese: '',
    keywords: '',
    is_active: true,
    order_index: 0,
  });

  useEffect(() => {
    if (isOpen) {
      if (textId) {
        fetchTextData();
      } else {
        // Create mode - fetch categories
        fetchCategories();
      }
    }
  }, [isOpen, textId]);

  const fetchCategories = async () => {
    try {
      const response = await api.getCategories({ active_only: 'true' });
      // Flatten categories recursively
      const flattenCategories = (cats: any[]): any[] => {
        let result: any[] = [];
        cats.forEach(cat => {
          result.push(cat);
          if (cat.children && cat.children.length > 0) {
            result = result.concat(flattenCategories(cat.children));
          }
        });
        return result;
      };
      setCategories(flattenCategories(response.categories || []));
    } catch (error: any) {
      console.error('Failed to fetch categories:', error);
      toast.error('Failed to load categories');
    }
  };

  const fetchTextData = async () => {
    if (!textId) return;
    
    try {
      setLoading(true);
      const response = await api.getTextById(textId, {
        include_collated: 'true',
        include_sections: 'true',
        include_metadata: 'true',
        include_editions: 'true',
      });
      
      setTextData(response);
      setCollatedContent(response.collated_content || null);
    } catch (error: any) {
      console.error('Failed to fetch text:', error);
      toast.error(error.message || 'Failed to load text details');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setTextData(null);
    setCollatedContent(null);
    setFormData({
      category_id: '',
      id_slug: '',
      title_english: '',
      title_tibetan: '',
      title_sanskrit: '',
      title_chinese: '',
      keywords: '',
      is_active: true,
      order_index: 0,
    });
    onClose();
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const title: any = {};
      if (formData.title_english) title.english = formData.title_english;
      if (formData.title_tibetan) title.tibetan = formData.title_tibetan;
      if (formData.title_sanskrit) title.sanskrit = formData.title_sanskrit;
      if (formData.title_chinese) title.chinese = formData.title_chinese;

      const keywordsArray = formData.keywords
        ? formData.keywords.split(',').map(k => k.trim()).filter(Boolean)
        : [];

      await api.createText({
        category_id: formData.category_id,
        id_slug: formData.id_slug,
        title: Object.keys(title).length > 0 ? title : undefined,
        keywords: keywordsArray,
        is_active: formData.is_active,
        order_index: formData.order_index,
      });
      toast.success('Text created successfully');
      handleClose();
      if (onSave) {
        await onSave({});
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create text');
    }
  };

  if (!isOpen) return null;

  // Create mode - show create form
  if (!textId && mode === 'edit') {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-scroll">
          <DialogHeader>
            <DialogTitle>Create New Text</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit} className="space-y-4" style={{fontFamily: isTibetan ? 'CustomTibetan' : ''}}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category_id">Category *</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.title?.english || cat.id_slug}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="id_slug">ID Slug *</Label>
                <Input
                  id="id_slug"
                  value={formData.id_slug}
                  onChange={(e) => setFormData({ ...formData, id_slug: e.target.value })}
                  required
                  placeholder="e.g., text-001"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title_english">English Title</Label>
                <Input
                  id="title_english"
                  value={formData.title_english}
                  onChange={(e) => setFormData({ ...formData, title_english: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title_tibetan">Tibetan Title</Label>
                <Input
                  id="title_tibetan"
                  value={formData.title_tibetan}
                  onChange={(e) => setFormData({ ...formData, title_tibetan: e.target.value })}
                  className="font-tibetan"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title_sanskrit">Sanskrit Title</Label>
                <Input
                  id="title_sanskrit"
                  value={formData.title_sanskrit}
                  onChange={(e) => setFormData({ ...formData, title_sanskrit: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title_chinese">Chinese Title</Label>
                <Input
                  id="title_chinese"
                  value={formData.title_chinese}
                  onChange={(e) => setFormData({ ...formData, title_chinese: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="keywords">Keywords (comma-separated)</Label>
              <Input
                id="keywords"
                value={formData.keywords}
                onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                placeholder="keyword1, keyword2, keyword3"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="order_index">Order Index</Label>
                <Input
                  id="order_index"
                  type="number"
                  value={formData.order_index}
                  onChange={(e) => setFormData({ ...formData, order_index: Number.parseInt(e.target.value, 10) || 0 })}
                />
              </div>
              <div className="space-y-2 flex items-center">
                <Label htmlFor="is_active" className="flex items-center gap-2 cursor-pointer">
                  <input
                    id="is_active"
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4"
                  />
                  Active
                </Label>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit">
                Create Text
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-scroll">
        <DialogHeader>
          <DialogTitle>
            {(() => {
              if (mode === 'view') return 'View Text Details';
              return textId ? 'Edit Text' : 'Create Text';
            })()}
          </DialogTitle>
        </DialogHeader>

        {loading && (
          <div className="py-8 text-center">
            <p className="text-gray-500">Loading text details...</p>
          </div>
        )}
        {!loading && textData && (
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="collated">Collated Content</TabsTrigger>
              <TabsTrigger value="sections">Sections</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>English Title</Label>
                  <Input
                    value={textData.title?.english || ''}
                    disabled={mode === 'view'}
                    readOnly
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tibetan Title</Label>
                  <Input
                    value={textData.title?.tibetan || ''}
                    disabled={mode === 'view'}
                    readOnly
                    className="font-tibetan"
                  />
                </div>
              </div>

              {textData.title?.sanskrit && (
                <div className="space-y-2">
                  <Label>Sanskrit Title</Label>
                  <Input
                    value={textData.title.sanskrit}
                    disabled={mode === 'view'}
                    readOnly
                  />
                </div>
              )}

              {textData.title?.chinese && (
                <div className="space-y-2">
                  <Label>Chinese Title</Label>
                  <Input
                    value={textData.title.chinese}
                    disabled={mode === 'view'}
                    readOnly
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label>ID Slug</Label>
                <Input
                  value={textData.id_slug || ''}
                  disabled
                  readOnly
                />
              </div>

              <div className="space-y-2">
                <Label>Category ID</Label>
                <Input
                  value={textData.category_id || ''}
                  disabled
                  readOnly
                />
              </div>

              {textData.metadata && textData.metadata.length > 0 && (
                <div className="space-y-2">
                  <Label>Metadata</Label>
                  <div className="border rounded-md p-4 space-y-2 max-h-48 overflow-y-auto">
                    {textData.metadata.map((meta: any) => {
                      const uniqueKey = `${meta.key}-${meta.group || ''}-${meta.value?.substring(0, 20) || ''}`;
                      return (
                        <div key={uniqueKey} className="text-sm">
                          <span className="font-semibold">{meta.key}:</span> {meta.value}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="collated" className="space-y-4 mt-4">
              {collatedContent ? (
                <>
                  <div className="space-y-2">
                    <Label>Collated Text (Tibetan)</Label>
                    <Textarea
                      value={collatedContent.collated_text || ''}
                      disabled={mode === 'view'}
                      readOnly={mode === 'view'}
                      className="min-h-[300px] font-tibetan"
                      placeholder="No collated text available"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>English Translation</Label>
                    <Textarea
                      value={collatedContent.english_translation || ''}
                      disabled={mode === 'view'}
                      readOnly={mode === 'view'}
                      className="min-h-[300px]"
                      placeholder="No English translation available"
                    />
                  </div>
                </>
              ) : (
                <div className="py-8 text-center text-gray-500">
                  <p>No collated content available for this text.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="sections" className="space-y-4 mt-4">
              {textData.sections && textData.sections.length > 0 ? (
                <div className="space-y-4">
                  {textData.sections.map((section: any, index: number) => (
                    <div key={section.id || `section-${index}`} className="border rounded-md p-4">
                      <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold capitalize">
                        {section.section_type?.replaceAll('-', ' ')}
                      </h4>
                        <span className="text-xs text-gray-500">
                          Order: {section.order_index}
                        </span>
                      </div>
                      {section.title?.english && (
                        <p className="text-sm font-medium mb-2">
                          {section.title.english}
                        </p>
                      )}
                      {section.title?.tibetan && (
                        <p className="text-sm font-medium mb-2 font-tibetan">
                          {section.title.tibetan}
                        </p>
                      )}
                      {section.content?.english && (
                        <div className="text-sm text-gray-700 mb-2">
                          <strong>English:</strong>
                          <p className="mt-1 whitespace-pre-wrap">{section.content.english}</p>
                        </div>
                      )}
                      {section.content?.tibetan && (
                        <div className="text-sm text-gray-700 font-tibetan">
                          <strong>Tibetan:</strong>
                          <p className="mt-1 whitespace-pre-wrap">{section.content.tibetan}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-gray-500">
                  <p>No sections available for this text.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
        {!loading && !textData && (
          <div className="py-8 text-center text-gray-500">
            <p>No text data available.</p>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Close
          </Button>
          {mode === 'edit' && onSave && (
            <Button onClick={() => onSave?.(textData)}>
              Save Changes
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
