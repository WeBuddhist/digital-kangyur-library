import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/atoms/button';
import { Input } from '@/components/ui/atoms/input';
import { Label } from "@/components/ui/atoms/label";
import { Switch } from "@/components/ui/atoms/switch";
import { X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/atoms/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/atoms/select";
import { useLanguage } from '@/hooks/useLanguage';
import { toast } from 'sonner';
import { api } from '@/utils/api';

interface TextFormProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  data?: any;
  subCategories: any[];
  mainCategories: any[];
  defaultSubCategoryId?: string | null;
  onSave: (data: any) => void;
}

export const TextForm = ({ isOpen, onClose, mode, data, subCategories, mainCategories, defaultSubCategoryId, onSave }: TextFormProps) => {
  const { t,isTibetan } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState(() => {
    if (data) {
      return {
        sub_category_id: data.sub_category_id ? String(data.sub_category_id) : '',
        derge_id: data.derge_id || '',
        yeshe_de_id: data.yeshe_de_id || '',
        tibetan_title: data.tibetan_title || '',
        chinese_title: data.chinese_title || '',
        sanskrit_title: data.sanskrit_title || '',
        english_title: data.english_title || '',
        sermon: data.sermon || '',
        yana: data.yana || '',
        translation_period: data.translation_period || '',
        yeshe_de_volume_number: data.yeshe_de_volume_number || '',
        yeshe_de_volume_length: data.yeshe_de_volume_length || '',
        pecing_link: data.pecing_link || '',
        narthang_link: data.narthang_link || '',
        pdf_url: data.pdf_url || '',
        order_index: data.order_index || 0,
        is_active: data.is_active ?? true,
      };
    }
    return {
      sub_category_id: defaultSubCategoryId ? String(defaultSubCategoryId) : '',
      derge_id: '',
      yeshe_de_id: '',
      yeshe_de_volume_number: '',
      yeshe_de_volume_length: '',
      tibetan_title: '',
      chinese_title: '',
      sanskrit_title: '',
      english_title: '',
      sermon: '',
      yana: '',
      translation_period: '',
      pecing_link: '',
      narthang_link: '',
      pdf_url: '',
      order_index: 0,
      is_active: true,
    };
  });

  // Update formData when data changes or when dialog opens
  useEffect(() => {
    if (isOpen) {
      if (data && mode === 'edit') {
        // Ensure we use the actual data values, converting types as needed
        setFormData({
          sub_category_id: data.sub_category_id ? String(data.sub_category_id) : '',
          derge_id: data.derge_id || '',
          yeshe_de_id: data.yeshe_de_id || '',
          tibetan_title: data.tibetan_title || '',
          chinese_title: data.chinese_title || '',
          sanskrit_title: data.sanskrit_title || '',
          english_title: data.english_title || '',
          sermon: data.sermon || '',
          yana: data.yana || '',
          translation_period: data.translation_period || '',
          yeshe_de_volume_number: data.yeshe_de_volume_number || '',
          yeshe_de_volume_length: data.yeshe_de_volume_length || '',
          pecing_link: data.pecing_link || '',
          narthang_link: data.narthang_link || '',
          pdf_url: data.pdf_url || '',
          order_index: data.order_index || 0,
          is_active: data.is_active ?? true,
        });
      } else {
        // Create mode or no data
        setFormData({
          sub_category_id: defaultSubCategoryId ? String(defaultSubCategoryId) : '',
          derge_id: '',
          yeshe_de_id: '',
          yeshe_de_volume_number: '',
          yeshe_de_volume_length: '',
          tibetan_title: '',
          chinese_title: '',
          sanskrit_title: '',
          english_title: '',
          sermon: '',
          yana: '',
          translation_period: '',
          pecing_link: '',
          narthang_link: '',
          pdf_url: '',
          order_index: 0,
          is_active: true,
        });
      }
    }
  }, [isOpen, data, defaultSubCategoryId, mode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.sub_category_id) {
      toast.error(t('pleaseSelectCategory'));
      return;
    }
    
    onSave(formData);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (file.type !== 'application/pdf') {
      toast.error(t('pleaseSelectPdfFile'));
      return;
    }

    // Validate file size (100MB limit)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      toast.error(t('fileSizeMustBeLessThan100MB'));
      return;
    }

    setUploading(true);
    try {
      const result = await api.uploadFile(file);
      setFormData({ ...formData, pdf_url: result.url });
      toast.success(t('pdfUploadedSuccessfully'));
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || t('failedToUploadPdf'));
    } finally {
      setUploading(false);
    }
  };

  const handleResetPdfUrl = () => {
    setFormData({ ...formData, pdf_url: '' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    // Reset form when closing
    if (data && mode === 'edit') {
      // Reset to original data
      setFormData({
        sub_category_id: data.sub_category_id ? String(data.sub_category_id) : '',
        derge_id: data.derge_id || '',
        yeshe_de_id: data.yeshe_de_id || '',
        tibetan_title: data.tibetan_title || '',
        chinese_title: data.chinese_title || '',
        sanskrit_title: data.sanskrit_title || '',
        english_title: data.english_title || '',
        sermon: data.sermon || '',
        yana: data.yana || '',
        translation_period: data.translation_period || '',
        yeshe_de_volume_number: data.yeshe_de_volume_number || '',
        yeshe_de_volume_length: data.yeshe_de_volume_length || '',
        pecing_link: data.pecing_link || '',
        narthang_link: data.narthang_link || '',
        pdf_url: data.pdf_url || '',
        order_index: data.order_index || 0,
        is_active: data.is_active ?? true,
      });
    } else {
      // Reset to empty for create mode
      setFormData({
        sub_category_id: defaultSubCategoryId ? String(defaultSubCategoryId) : '',
        derge_id: '',
        yeshe_de_id: '',
        yeshe_de_volume_number: '',
        yeshe_de_volume_length: '',
        tibetan_title: '',
        chinese_title: '',
        sanskrit_title: '',
        english_title: '',
        sermon: '',
        yana: '',
        translation_period: '',
        pecing_link: '',
        narthang_link: '',
        pdf_url: '',
        order_index: 0,
        is_active: true,
      });
    }
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };
  // Example: "487abda9-c6c8-4296-afb0-f3c58ef7c78c_intro.pdf" => "intro.pdf"
  const pdf_name = formData.pdf_url
    ? (() => {
        const filename = formData.pdf_url.split('/').pop() || '';
        const parts = filename.split('_');
        return parts.length > 1 ? parts.slice(1).join('_') : filename;
      })()
    : '';
  const handleSubCategoryChange = (value: string) => 
    {
      setFormData({ ...formData, sub_category_id: value });
    }
  return (
    <Dialog open={isOpen} onOpenChange={handleClose} key={data?.id || 'create'}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-scroll">
          <DialogHeader>
          <DialogTitle>{mode === 'create' ? t('createNewText') : t('editText')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6" style={{fontFamily: isTibetan ? 'CustomTibetan' : ''}}>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sub_category_id">{t('subCategory')} <span className="text-red-600">*</span></Label>
                <Select
                  value={formData.sub_category_id ? String(formData.sub_category_id) : ''}
                  onValueChange={handleSubCategoryChange}
                  required
                  disabled={!!defaultSubCategoryId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('selectSubcategory')} />
                  </SelectTrigger>
                  <SelectContent>
                    {subCategories.map(category => (
                      <SelectItem key={category.id} value={String(category.id)}>
                        {category.name_english}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {defaultSubCategoryId && (
                  <p className="text-sm text-gray-500 mt-1">
                    {t('creatingTextUnder')} {subCategories.find(sc => sc.id === defaultSubCategoryId)?.name_english}
                  </p>
                )}
              </div>
              {/* <div className="space-y-2">
                <Label htmlFor="order_index">{t('orderIndex')} </Label>
                <Input
                  id="order_index"
                  type="number"
                  value={formData.order_index}
                  onChange={(e) => setFormData({ ...formData, order_index: Number.parseInt(e.target.value, 10) || 0 })}
                />
              </div> */}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="derge_id">{t('dergeId')} <span className="text-red-600">*</span></Label>
                <Input
                  id="derge_id"
                  value={formData.derge_id}
                  onChange={(e) => setFormData({ ...formData, derge_id: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="yeshe_de_id">{t('yesheDeId')} </Label>
                <Input
                  id="yeshe_de_id"
                  value={formData.yeshe_de_id}
                  onChange={(e) => setFormData({ ...formData, yeshe_de_id: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="english_title">{t('englishTitle')} <span className="text-red-600">*</span></Label>
                <Input
                  id="english_title"
                  value={formData.english_title}
                  onChange={(e) => setFormData({ ...formData, english_title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tibetan_title">{t('tibetanTitle')} <span className="text-red-600">*</span></Label>
                <Input
                  id="tibetan_title"
                  value={formData.tibetan_title}
                  onChange={(e) => setFormData({ ...formData, tibetan_title: e.target.value })}
                  className="font-tibetan"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sanskrit_title">{t('sanskritTitle')} </Label>
                <Input
                  id="sanskrit_title"
                  value={formData.sanskrit_title}
                  onChange={(e) => setFormData({ ...formData, sanskrit_title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="chinese_title">{t('chineseTitle')} </Label>
                <Input
                  id="chinese_title"
                  value={formData.chinese_title}
                  onChange={(e) => setFormData({ ...formData, chinese_title: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="yeshe_de_volume_number">{t('yesheDeVolumeNumber')} </Label>
                <Input
                  id="yeshe_de_volume_number"
                  value={formData.yeshe_de_volume_number}
                  onChange={(e) => setFormData({ ...formData, yeshe_de_volume_number: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pdf_url">{t('yesheDeSourceText')} </Label>
                <div className={`${!formData.pdf_url ? 'flex' : 'hidden'} gap-2`} >
                  <Input
                    id="pdf_url"
                    value={formData.pdf_url}
                    onChange={(e) => setFormData({ ...formData, pdf_url: e.target.value })}
                    placeholder={t('enterPdfUrlOrUploadFile')}
                    className="flex-1"
                  />
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="pdf_file_upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    {uploading ? t('uploading') : t('uploadPdf')}
                  </Button>
                </div>
                {formData.pdf_url && (
                  <div className="flex items-center gap-2 mt-2">
                    <p className="text-muted-foreground flex-1">
                   <a href={formData.pdf_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">{pdf_name}</a>
                    </p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleResetPdfUrl}
                      className="h-6 w-6 p-0"
                      title={t('resetPdfUrl')}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>


            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sermon">{t('sermon')} </Label>
                <Select
                  value={formData.sermon || undefined}
                  onValueChange={(value) => setFormData({ ...formData, sermon: value || '' })}
                >
                  <SelectTrigger id="sermon">
                    <SelectValue placeholder={t('selectSermon')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="First Sermon">{t('sermonFirst')}</SelectItem>
                    <SelectItem value="Second Sermon">{t('sermonSecond')}</SelectItem>
                    <SelectItem value="Third Sermon">{t('sermonThird')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="yana">{t('yana')} </Label>
                <Select
                  value={formData.yana || undefined}
                  onValueChange={(value) => setFormData({ ...formData, yana: value || '' })}
                >
                  <SelectTrigger id="yana">
                    <SelectValue placeholder={t('selectYana')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Hinayana">{t('yanaHinayana')}</SelectItem>
                    <SelectItem value="Mahayana">{t('yanaMahayana')}</SelectItem>
                    <SelectItem value="Vajrayana">{t('yanaVajrayana')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="translation_period">{t('translationPeriod')} </Label>
                <Select
                  value={formData.translation_period || undefined}
                  onValueChange={(value) => setFormData({ ...formData, translation_period: value || '' })}
                >
                  <SelectTrigger id="translation_period">
                    <SelectValue placeholder={t('selectTranslationPeriod')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Early Translation">{t('translationPeriodEarly')}</SelectItem>
                    <SelectItem value="New Translation">{t('translationPeriodNew')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pecing_link">{t('pecingLink')}</Label>
                <Input
                  id="pecing_link"
                  value={formData.pecing_link}
                  onChange={(e) => setFormData({ ...formData, pecing_link: e.target.value })}
                  placeholder={t('enterPecingLinkUrl')}
                  type="url"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="narthang_link">{t('narthangLink')}</Label>
                <Input
                  id="narthang_link"
                  value={formData.narthang_link}
                  onChange={(e) => setFormData({ ...formData, narthang_link: e.target.value })}
                  placeholder={t('enterNarthangLinkUrl')}
                  type="url"
                />
              </div>
            </div>

            {/* <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="is_active">{t('active')}</Label>
            </div> */}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              {t('cancel')}
            </Button>
            <Button type="submit">
              {mode === 'create' ? t('createText') : t('saveChanges')}
            </Button>
          </DialogFooter>
        
        </form>
      </DialogContent>
    </Dialog>
  );
};
