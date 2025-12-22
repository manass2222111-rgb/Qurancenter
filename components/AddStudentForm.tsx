
import React, { useState, useEffect, useMemo } from 'react';
import { Student } from '../types';

interface AddStudentFormProps {
  onAdd: (student: Student) => void;
  onCancel: () => void;
  studentsCount: number;
  students: Student[];
  isSaving?: boolean;
}

const LEVEL_ORDER = ['تمهيدي', 'الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس'];

const AddStudentForm: React.FC<AddStudentFormProps> = ({ onAdd, onCancel, studentsCount, students, isSaving = false }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<Student>>({
    regDate: new Date().toISOString().split('T')[0],
    fees: 'لا',
    completion: '0%'
  });

  // استخراج القوائم الذكية من البيانات الحالية
  const dropdownOptions = useMemo(() => {
    const getUnique = (key: keyof Student) => 
      Array.from(new Set(students.map(s => s[key]).filter(v => v && v.trim() !== ''))).sort();

    return {
      teachers: getUnique('teacher'),
      circles: getUnique('circle'),
      categories: getUnique('category'),
      periods: getUnique('period'),
    };
  }, [students]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
  };

  useEffect(() => {
    const totalFields = 19;
    const filledFields = Object.values(formData).filter(v => v && v !== '').length;
    const percentage = Math.round((filledFields / totalFields) * 100);
    setFormData(prev => ({ ...prev, completion: `${percentage}%` }));
  }, [formData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;

    const newStudent: Student = {
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
    };
    onAdd(newStudent);
  };

  const steps = [
    { title: 'البيانات الشخصية', icon: '👤' },
    { title: 'المسار التعليمي', icon: '📖' },
    { title: 'البيانات الإدارية', icon: '📂' }
  ];

  return (
    <div className={`max-w-4xl mx-auto bg-white rounded-[3rem] border border-slate-100 shadow-2xl overflow-hidden mb-10 transition-opacity ${isSaving ? 'opacity-70 pointer-events-none' : ''}`}>
      <div className="bg-[#0F172A] p-10 text-white flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-black mb-1">تسجيل دارس جديد</h3>
          <p className="text-indigo-400 text-[10px] font-bold uppercase tracking-widest">اكتمال الملف: {formData.completion}</p>
        </div>
        <div className="flex gap-4 items-center">
          <div className="text-left ml-4">
            <p className="text-xs font-bold text-slate-500">الخطوة {step} من 3</p>
            <p className="text-sm font-black">{steps[step - 1].title}</p>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3].map(s => (
              <div key={s} className={`w-8 h-1.5 rounded-full transition-all duration-500 ${step >= s ? 'bg-indigo-500' : 'bg-slate-700'}`}></div>
            ))}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-12 space-y-10">
        
        {step === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-up">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase pr-2">اسم الدارس رباعياً</label>
              <input name="name" type="text" value={formData.name || ''} onChange={handleChange} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold" placeholder="أدخل الاسم..." required />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase pr-2">رقم الهاتف</label>
              <input name="phone" type="text" value={formData.phone || ''} onChange={handleChange} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold" placeholder="05xxxxxxxx" />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase pr-2">الجنسية</label>
              <input name="nationality" type="text" value={formData.nationality || ''} onChange={handleChange} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold" placeholder="سعودي، مصري..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase pr-2">تاريخ الميلاد</label>
                <input name="dob" type="date" lang="en" dir="ltr" value={formData.dob || ''} onChange={handleChange} className="w-full px-4 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold text-right" />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase pr-2">العمر</label>
                <input name="age" type="number" value={formData.age || ''} onChange={handleChange} className="w-full px-4 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold" readOnly />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase pr-2">السكن</label>
              <input name="address" type="text" value={formData.address || ''} onChange={handleChange} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold" placeholder="الحي..." />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase pr-2">المؤهل الدراسي</label>
              <input name="qualification" type="text" value={formData.qualification || ''} onChange={handleChange} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold" />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-up">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase pr-2">المحفظ</label>
              <select name="teacher" value={formData.teacher || ''} onChange={handleChange} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold appearance-none">
                <option value="">اختر من القائمة</option>
                {dropdownOptions.teachers.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase pr-2">الحلقة</label>
              <select name="circle" value={formData.circle || ''} onChange={handleChange} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold appearance-none">
                <option value="">اختر من القائمة</option>
                {dropdownOptions.circles.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase pr-2">المستوى</label>
              <select name="level" value={formData.level || ''} onChange={handleChange} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold appearance-none">
                <option value="">اختر المستوى</option>
                {LEVEL_ORDER.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase pr-2">الجزء الحالي</label>
              <input name="part" type="number" min="1" max="30" value={formData.part || ''} onChange={handleChange} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold" placeholder="1-30" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-[11px] font-black text-slate-400 uppercase pr-2">تاريخ التسجيل</label>
              <input name="regDate" type="date" lang="en" dir="ltr" value={formData.regDate || ''} onChange={handleChange} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold text-right" />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-up">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase pr-2">رقم الهوية</label>
              <input name="nationalId" type="text" value={formData.nationalId || ''} onChange={handleChange} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold" placeholder="10xxxxxxxx" />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase pr-2">الفئة</label>
              <select name="category" value={formData.category || ''} onChange={handleChange} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold">
                <option value="">اختر الفئة</option>
                {dropdownOptions.categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase pr-2">الفترة</label>
              <select name="period" value={formData.period || ''} onChange={handleChange} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold">
                <option value="">اختر الفترة</option>
                {dropdownOptions.periods.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-[11px] font-black text-slate-400 uppercase pr-2">سداد الرسوم</label>
              <div className="flex gap-4">
                {['نعم', 'لا'].map(option => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setFormData(p => ({ ...p, fees: option }))}
                    className={`flex-1 py-4 rounded-2xl font-black transition-all border ${formData.fees === option ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100' : 'bg-slate-50 text-slate-400 border-transparent hover:bg-slate-100'}`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center pt-10 border-t border-slate-50">
          <button type="button" onClick={onCancel} className="text-slate-400 font-black text-sm hover:text-rose-600 transition-colors">إلغاء</button>
          <div className="flex gap-4">
            {step > 1 && (
              <button type="button" onClick={() => setStep(step - 1)} className="px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-sm">السابق</button>
            )}
            {step < 3 ? (
              <button type="button" onClick={() => setStep(step + 1)} className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-xl hover:bg-indigo-700 transition-all">المتابعة</button>
            ) : (
              <button type="submit" disabled={isSaving} className="px-10 py-4 bg-emerald-600 text-white rounded-2xl font-black text-sm shadow-xl hover:bg-emerald-700 transition-all">إتمام التسجيل</button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddStudentForm;
