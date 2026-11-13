import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/atoms/button';
import { Input } from '@/components/ui/atoms/input';
import { Label } from '@/components/ui/atoms/label';
import { Textarea } from '@/components/ui/atoms/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/atoms/dialog';
import { toast } from 'sonner';

export interface TimelinePeriodFormData {
  id_slug: string;
  name_english: string;
  name_tibetan: string;
  description: string;
  start_year: number;
  end_year: number;
}

interface TimelinePeriodFormProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  /** A period as returned by GET /timeline/periods. */
  data?: any;
  onSave: (data: TimelinePeriodFormData) => Promise<void>;
}

const emptyForm = {
  id_slug: '',
  name_english: '',
  name_tibetan: '',
  description: '',
  start_year: '',
  end_year: '',
};

export const TimelinePeriodForm = ({ isOpen, onClose, mode, data, onSave }: TimelinePeriodFormProps) => {
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (mode === 'edit' && data) {
      setFormData({
        id_slug: data.id_slug || '',
        name_english: data.name?.english || '',
        name_tibetan: data.name?.tibetan || '',
        description: data.description || '',
        start_year: data.start_year?.toString() ?? '',
        end_year: data.end_year?.toString() ?? '',
      });
    } else {
      setFormData(emptyForm);
    }
  }, [isOpen, mode, data]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const start = Number.parseInt(formData.start_year, 10);
    const end = Number.parseInt(formData.end_year, 10);
    if (Number.isNaN(start) || Number.isNaN(end)) {
      toast.error('Start and end years are required');
      return;
    }
    if (start > end) {
      toast.error('Start year must not be after end year');
      return;
    }

    try {
      setSaving(true);
      await onSave({
        id_slug: formData.id_slug.trim(),
        name_english: formData.name_english.trim(),
        name_tibetan: formData.name_tibetan.trim(),
        description: formData.description.trim(),
        start_year: start,
        end_year: end,
      });
    } catch {
      // The parent shows the error toast and keeps the dialog open.
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Create History Period' : 'Edit History Period'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="period_name_english">English Name *</Label>
              <Input
                id="period_name_english"
                value={formData.name_english}
                onChange={(e) => setFormData({ ...formData, name_english: e.target.value })}
                required
                placeholder="e.g., Block-Printed Editions"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="period_name_tibetan">Tibetan Name</Label>
              <Input
                id="period_name_tibetan"
                value={formData.name_tibetan}
                onChange={(e) => setFormData({ ...formData, name_tibetan: e.target.value })}
                className="tibetan"
                placeholder="དུས་རིམ་གྱི་མིང་།"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="period_start_year">Start Year (CE) *</Label>
              <Input
                id="period_start_year"
                type="number"
                value={formData.start_year}
                onChange={(e) => setFormData({ ...formData, start_year: e.target.value })}
                required
                placeholder="e.g., 1410"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="period_end_year">End Year (CE) *</Label>
              <Input
                id="period_end_year"
                type="number"
                value={formData.end_year}
                onChange={(e) => setFormData({ ...formData, end_year: e.target.value })}
                required
                placeholder="e.g., 1910"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="period_slug">Slug</Label>
            <Input
              id="period_slug"
              value={formData.id_slug}
              onChange={(e) => setFormData({ ...formData, id_slug: e.target.value })}
              placeholder={mode === 'create' ? 'Generated from the English name if left blank' : ''}
            />
            <p className="text-xs text-muted-foreground">
              Lowercase identifier used in URLs and translations (e.g., block-printed). Changing the slug of an
              existing period removes its built-in translated title on the History page.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="period_description">Description</Label>
            <Textarea
              id="period_description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              placeholder="Optional notes about this period"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {mode === 'create' ? 'Create Period' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
