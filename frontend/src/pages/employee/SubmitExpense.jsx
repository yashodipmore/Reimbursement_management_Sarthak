import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '../../api/axios';

const categories = ['travel', 'food', 'accommodation', 'equipment', 'other'];

export default function SubmitExpense() {
  const [ocrLoading, setOcrLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      currency: 'INR',
      category: 'travel',
    },
  });

  const handleOCR = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('receipt', file);
    setOcrLoading(true);

    try {
      const res = await api.post('/expenses/ocr', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const extracted = res.data.extracted || {};
      if (extracted.title) setValue('title', extracted.title);
      if (extracted.amount) setValue('amount', extracted.amount);
      if (extracted.currency) setValue('currency', extracted.currency);
      if (extracted.category) setValue('category', extracted.category);
      if (extracted.description) setValue('description', extracted.description);
      if (extracted.date) setValue('date', extracted.date);
      toast.success('Receipt scanned and fields pre-filled');
    } catch {
      toast.error('OCR scan failed. Fill details manually.');
    } finally {
      setOcrLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setSubmitLoading(true);
    try {
      await api.post('/expenses', {
        title: data.title,
        amount: Number(data.amount),
        currency: data.currency,
        category: data.category,
        description: data.description,
        date: data.date,
      });
      toast.success('Expense submitted successfully');
      reset({ currency: data.currency, category: 'travel' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit expense');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <section className="panel">
      <div className="panel-head">
        <h2>Submit Expense</h2>
      </div>

      <div className="upload-box">
        <label htmlFor="receipt">Upload receipt for OCR (optional)</label>
        <input id="receipt" type="file" accept="image/*" onChange={handleOCR} />
        {ocrLoading && <p className="muted">Scanning receipt...</p>}
      </div>

      <form className="form-grid" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label htmlFor="title">Title</label>
          <input id="title" {...register('title', { required: 'Title is required' })} />
          {errors.title && <p className="error-text">{errors.title.message}</p>}
        </div>

        <div>
          <label htmlFor="amount">Amount</label>
          <input id="amount" type="number" step="0.01" {...register('amount', { required: 'Amount is required' })} />
          {errors.amount && <p className="error-text">{errors.amount.message}</p>}
        </div>

        <div>
          <label htmlFor="currency">Currency</label>
          <input id="currency" {...register('currency', { required: 'Currency is required' })} />
        </div>

        <div>
          <label htmlFor="category">Category</label>
          <select id="category" {...register('category')}>
            {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>

        <div>
          <label htmlFor="date">Expense Date</label>
          <input id="date" type="date" {...register('date', { required: 'Date is required' })} />
          {errors.date && <p className="error-text">{errors.date.message}</p>}
        </div>

        <div className="full-span">
          <label htmlFor="description">Description</label>
          <textarea id="description" rows="4" {...register('description')} />
        </div>

        <button type="submit" className="btn-primary action-btn" disabled={submitLoading}>
          {submitLoading ? 'Submitting...' : 'Submit Expense'}
        </button>
      </form>
    </section>
  );
}
