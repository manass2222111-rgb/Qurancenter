
import React from 'react';
import { Student } from '../types';

interface NotificationPanelProps {
  notifications: {
    expiredIds: Student[];
    expiringSoonIds: Student[];
    unpaidFees: Student[];
  };
  onClose: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ notifications, onClose }) => {
  const { expiredIds, expiringSoonIds, unpaidFees } = notifications;
  const total = expiredIds.length + expiringSoonIds.length + unpaidFees.length;

  return (
    <div className="absolute left-0 mt-2 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-[60] overflow-hidden animate-in fade-in zoom-in duration-200 origin-top-left">
      <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-teal-600 text-white">
        <h3 className="font-bold">التنبيهات ({total})</h3>
        <button onClick={onClose} className="hover:bg-teal-700 p-1 rounded-full transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="max-h-[450px] overflow-y-auto p-2 space-y-4">
        {/* الهويات المنتهية */}
        {expiredIds.length > 0 && (
          <div>
            <div className="px-3 py-1 text-xs font-bold text-red-600 bg-red-50 rounded-lg mb-2">هويات منتهية ({expiredIds.length})</div>
            <div className="space-y-1">
              {expiredIds.map(s => (
                <div key={s.id} className="p-3 hover:bg-gray-50 rounded-xl border border-transparent hover:border-red-100 transition-all group">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-gray-800 text-sm">{s.name}</span>
                    <span className="text-[10px] text-red-500 font-mono" dir="ltr">{s.expiryId}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">تاريخ الانتهاء قد مضى</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* هويات تقترب من الانتهاء */}
        {expiringSoonIds.length > 0 && (
          <div>
            <div className="px-3 py-1 text-xs font-bold text-amber-600 bg-amber-50 rounded-lg mb-2">تنتهي قريباً - خلال 30 يوم ({expiringSoonIds.length})</div>
            <div className="space-y-1">
              {expiringSoonIds.map(s => (
                <div key={s.id} className="p-3 hover:bg-gray-50 rounded-xl border border-transparent hover:border-amber-100 transition-all">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-gray-800 text-sm">{s.name}</span>
                    <span className="text-[10px] text-amber-600 font-mono" dir="ltr">{s.expiryId}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">يجب التنبيه لتجديد الهوية</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* رسوم غير مسددة */}
        {unpaidFees.length > 0 && (
          <div>
            <div className="px-3 py-1 text-xs font-bold text-teal-600 bg-teal-50 rounded-lg mb-2">رسوم غير مسددة ({unpaidFees.length})</div>
            <div className="space-y-1">
              {unpaidFees.map(s => (
                <div key={s.id} className="p-3 hover:bg-gray-50 rounded-xl border border-transparent hover:border-teal-100 transition-all">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-gray-800 text-sm">{s.name}</span>
                    <span className="text-[10px] text-teal-600">المعلم: {s.teacher}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">لم يتم تأكيد سداد الرسوم</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {total === 0 && (
          <div className="p-8 text-center text-gray-400">
            <div className="text-4xl mb-2">🎉</div>
            <p className="text-sm">لا توجد تنبيهات حالياً</p>
          </div>
        )}
      </div>
      
      <div className="p-3 bg-gray-50 text-center border-t border-gray-100">
        <button onClick={onClose} className="text-xs font-bold text-teal-600 hover:text-teal-800 transition-colors">إغلاق التنبيهات</button>
      </div>
    </div>
  );
};

export default NotificationPanel;
