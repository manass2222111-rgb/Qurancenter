
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Student } from '../types';

interface AddStudentFormProps {
  onAdd: (student: Student) => void;
  onCancel: () => void;
  studentsCount: number;
  students: Student[];
  isSaving?: boolean;
}

const LEVEL_ORDER = ['تمهيدي', 'الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس'];

// مكون مستقل للقائمة المنسدلة لمنع الاختفاء المفاجئ
const DynamicSelect = ({ name, label, options, placeholder, value, onChange, isManual, toggleManual }: any) => {
  return (
    <div className="space-y-2">
      <label className="text-[11px] font-black text-slate-400 uppercase pr-2">{label}</label>
      {isManual ? (
        <div className="relative group">
          <input 
            name={name} 
            type="text" 
            value={value || ''} 
            onChange={onChange}
            placeholder={`اكتب ${label} جديد...`}
            className="w-full px-6 py-4 bg-indigo-50 border-2 border-indigo-200 rounded-2xl outline-none font-bold text-indigo-700 shadow-inner"
            autoFocus
          />
          <button 
            type="button" 
            onClick={() => toggleManual(name, false)}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[9px] bg-white text-slate-400 px-3 py-1.5 rounded-xl shadow-sm font-black uppercase hover:text-indigo-600 border border-slate-100"
          >
            رجوع
          </button>
        </div>
      ) : (
        <div className="relative">
          <select 
            name={name} 
            value={value || ''} 
            onChange={(e) => {
              if (e.target.value === "__MANUAL__") {
                toggleManual(name, true);
              } else {
                onChange(e);
              }
            }} 
            className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold appearance-none cursor-pointer hover:bg-slate-100 transition-colors"
          >
            <option value="">{placeholder}</option>
            {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
            <option value="__MANUAL__" className="text-indigo-600 font-black">+ إضافة قيمة جديدة</option>
          </select>
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"/></svg>
          </div>
        </div>
      )}
    </div>
  );
};

const AddStudentForm: React.FC<AddStudentFormProps> = ({ onAdd, onCancel, studentsCount, students, isSaving = false }) => {
  const [step, setStep] = useState(1);
  const [manualInputs, setManualInputs] = useState<Record<string, boolean>>({});
  const [formData, setFormData] = useState<Partial<Student>>({
    regDate: new Date().toISOString().split('T')[0],
    fees: 'لا',
    completion: '0%'
  });

  const dropdownOptions = useMemo(() => {
    const getUnique = (key: keyof Student) => {
      const vals = students.map(s => s[key]).filter(v => v && v.trim() !== '');
      return Array.from(new Set(vals)).sort();
    };
    return {
      teachers: getUnique('teacher'),
      circles: getUnique('circle'),
      categories: getUnique('category'),
      periods: getUnique('period'),
    };
  }, [students]);

  const toggleManual = (name: string, isManual: boolean) => {
    setManualInputs(prev => ({ ...prev, [name]: isManual }));
  };

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (isSaving) return;
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      if (name === 'dob' && value) {
        const birthDate = new Date(value);
        const age = new Date().getFullYear() - birthDate.getFullYear();
        updated.age = age.toString();
      }
      return updated;
    });
  }, [isSaving]);

  useEffect(() => {
    const fields = ['name', 'phone', 'teacher', 'circle', 'level', 'nationalId'];
    const filled = fields.filter(k => (formData as any)[k]).length;
    const percentage = Math.round((filled / fields.length) * 100);
    setFormData(prev => ({ ...prev, completion: `${percentage}%` }));
  }, [formData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    onAdd({
      id: (studentsCount + 1).toString(),
      name: formData.name || '',
      nationality: formData.nationality || '',
      dob: formData.dob || '',
      phone: formData.phone || '',
      age: formData.age || '',
      qualification: formData.qualification || '',
      job: formData.job || '',
      address: formData.address || '',
      regDate: formData.regDate || '',
      level: formData.level || '',
      part: formData.part || '',
      nationalId: formData.nationalId || '',
      category: formData.category || '',
      period: formData.period || '',
      expiryId: formData.expiryId || '',
      teacher: formData.teacher || '',
      fees: formData.fees || 'لا',
      circle: formData.circle || '',
      completion: formData.completion || '0%'
    });
  };

  return (
    <div className={`max-w-4xl mx-auto bg-white rounded-[3rem] border border-slate-100 shadow-2xl overflow-hidden mb-10 ${isSaving ? 'opacity-60 pointer-events-none' : ''}`}>
      <div className="bg-[#0F172A] p-10 text-white flex justify-between items-center relative">
        <div className="relative z-10">
          <h3 className="text-2xl font-black mb-1">تسجيل دارس جديد</h3>
          <p className="text-indigo-400 text-[10px] font-bold uppercase tracking-widest">اكتمال البيانات: {formData.completion}</p>
        </div>
        <div className="flex gap-4 items-center z-10">
          <div className="text-right ml-4">
            <p className="text-xs font-bold text-slate-500">الخطوة {step} من 3</p>
            <p className="text-sm font-black">{step === 1 ? 'الشخصية' : step === 2 ? 'الأكاديمية' : 'الإدارية'}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-12 space-y-10">
        {step === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase pr-2">اسم الدارس رباعياً</label>
              <input name="name" type="text" value={formData.name || ''} onChange={handleChange} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold" placeholder="أدخل الاسم..." required />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase pr-2">رقم الهاتف</label>
              <input name="phone" type="text" value={formData.phone || ''} onChange={handleChange} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold" placeholder="05xxxxxxxx" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase pr-2">تاريخ الميلاد</label>
                <input name="dob" type="date" value={formData.dob || ''} onChange={handleChange} className="w-full px-4 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold text-right" />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase pr-2">العمر</label>
                <input name="age" type="text" value={formData.age || ''} readOnly className="w-full px-4 py-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-400" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase pr-2">الجنسية</label>
              <input name="nationality" type="text" value={formData.nationality || ''} onChange={handleChange} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold" placeholder="سعودي..." />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DynamicSelect 
              name="teacher" label="اسم المحفظ" options={dropdownOptions.teachers} placeholder="اختر المحفظ من الشيت"
              value={formData.teacher} onChange={handleChange} isManual={manualInputs.teacher} toggleManual={toggleManual}
            />
            <DynamicSelect 
              name="circle" label="الحلقة" options={dropdownOptions.circles} placeholder="اختر الحلقة من الشيت"
              value={formData.circle} onChange={handleChange} isManual={manualInputs.circle} toggleManual={toggleManual}
            />
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase pr-2">المستوى الأكاديمي</label>
              <select name="level" value={formData.level || ''} onChange={handleChange} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold appearance-none cursor-pointer">
                <option value="">اختر المستوى</option>
                {LEVEL_ORDER.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase pr-2">الجزء الحالي</label>
              <input name="part" type="number" min="1" max="30" value={formData.part || ''} onChange={handleChange} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold" placeholder="1-30" />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase pr-2">رقم الهوية</label>
              <input name="nationalId" type="text" value={formData.nationalId || ''} onChange={handleChange} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold" placeholder="10xxxxxxxx" />
            </div>
            <DynamicSelect 
              name="category" label="الفئة" options={dropdownOptions.categories} placeholder="اختر الفئة"
              value={formData.category} onChange={handleChange} isManual={manualInputs.category} toggleManual={toggleManual}
            />
            <div className="space-y-2 md:col-span-2 pt-4">
              <label className="text-[11px] font-black text-slate-400 uppercase pr-2">سداد الرسوم</label>
              <div className="flex gap-4">
                {['نعم', 'لا'].map(option => (
                  <button key={option} type="button" onClick={() => setFormData(p => ({ ...p, fees: option }))}
                    className={`flex-1 py-4 rounded-2xl font-black transition-all border ${formData.fees === option ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-400 border-transparent'}`}>
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center pt-10 border-t border-slate-50">
          <button type="button" onClick={onCancel} className="text-slate-400 font-black text-sm">إلغاء</button>
          <div className="flex gap-4">
            {step > 1 && <button type="button" onClick={() => setStep(step - 1)} className="px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-sm">السابق</button>}
            {step < 3 ? <button type="button" onClick={() => setStep(step + 1)} className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-xl">المتابعة</button>
            : <button type="submit" disabled={isSaving} className={`px-10 py-4 rounded-2xl font-black text-sm shadow-xl ${isSaving ? 'bg-slate-400' : 'bg-emerald-600 text-white'}`}>إتمام الحفظ</button>}
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddStudentForm;
