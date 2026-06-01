"use client";

import { useState, useMemo, memo } from "react";
import { FaStar } from "react-icons/fa";
import { LiaCertificateSolid } from "react-icons/lia";
import { Clock, CheckCircle, X, Truck } from "lucide-react";
import Image from "next/image";
import { IoMdEye } from "react-icons/io";

// ✅ إضافة دالة formatDriverData هنا
const formatDriverData = (offer) => {
  // Extract location from currect_location (note: API has typo "currect" instead of "current")
  const location = offer.driver?.currect_location;
  const lat = location?.lat ? parseFloat(location.lat) : null;
  const lng = location?.lng ? parseFloat(location.lng) : null;

  // Get driver name from user object or driver object
  const driverName =
    offer.driver?.user?.name ||
    offer.driver?.name ||
    `السائق ${offer.driver_id}`;
  const driverPhone =
    offer.driver?.user?.phone || offer.driver?.phone || "+966534561679";
  const driverUserId = offer.driver?.user?.id || offer.driver_id;
  const driverAvatar =
    offer.driver?.user?.avatar ||
    offer.driver?.personal_photo ||
    "/images/driver.png";

  return {
    id: offer.id,
    driverId: offer.driver_id,
    driverUserId: driverUserId, // User ID for profile navigation
    name: driverName,
    deliveryTime: `${offer.delivery_duration_minutes} د`,
    price: `${offer.price} `,
    rating: offer.driver?.rating || "4.5",
    successfulOrders: `(${offer.driver?.completed_orders || "1,439"}) طلب ناجح`,
    ordersCount: offer.driver?.total_orders || "238",
    status: offer.status,
    offerId: offer.id,
    createdAt: offer.created_at,
    vehicleType:
      offer.driver?.vehicle_size || offer.driver?.vehicle_type || "سيارة صغيرة",
    phone: driverPhone,
    avatar: driverAvatar,
    // Location data for map
    lat: lat,
    lng: lng,
    // Store full location object for reference
    location: location,
    // ✅ إضافة البيانات الخام للـ driver للتأكد من تمرير كل شيء
    driver: offer.driver,
  };
};

// DriverCard Component - Optimized with memo and useMemo
const DriverCard = memo(function DriverCard({
  id,
  driverId,
  name,
  deliveryTime,
  price,
  rating,
  successfulOrders,
  ordersCount,
  status,
  onAcceptOrder, // ✅ هذه الدالة ستستخدم لفتح بوب اب الدفع في حالة pendingPayment
  onViewProfile,
  isSelectedForPayment = false,
  isPending = true,
  isAccepted = false,
  isPendingPayment = false,
  isExpired = false,
  isPaid = false,
  isDelivered = false,
  isRejected = false,
  isCancelled = false,
  isInRoad = false,
  isOrderExpired = false,
  offerId,
  createdAt,
  vehicleType,
  phone,
  avatar,
  index,
}) {
  const [accepting, setAccepting] = useState(false);

  const handleAccept = async () => {
    // ✅ منع القبول في حالات معينة
    if (
      isOrderExpired ||
      isCancelled ||
      isExpired ||
      isInRoad ||
      isDelivered ||
      isRejected
    ) {
      return;
    }

    // ✅ في حالة isPendingPayment، نسمح بالنقر لفتح بوب اب الدفع
    if (isPendingPayment) {
      if (onAcceptOrder) {
        await onAcceptOrder();
      }
      return;
    }

    // ✅ منع القبول في الحالات الأخرى
    if (
      !isPending ||
      accepting ||
      isAccepted ||
      isSelectedForPayment ||
      isPaid ||
      isDelivered ||
      isCancelled ||
      isRejected ||
      isInRoad
    )
      return;

    setAccepting(true);
    try {
      await onAcceptOrder();
    } finally {
      setAccepting(false);
    }
  };

  // Memoize time ago calculation
  const timeAgo = useMemo(() => {
    if (!createdAt) return "الآن";
    const now = new Date();
    const created = new Date(createdAt);
    const diffMs = now - created;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "الآن";
    if (diffMins < 60) return `قبل ${diffMins} دقيقة`;
    if (diffMins < 1440) return `قبل ${Math.floor(diffMins / 60)} ساعة`;
    return `قبل ${Math.floor(diffMins / 1440)} يوم`;
  }, [createdAt]);

  // ✅ تعريف badgeColor أولاً
  const badgeColor = useMemo(() => {
    const colors = [
      "from-[#579BE8] to-[#4a8dd8]",
      "from-[#579BE8] to-[#4a8dd8]",
      "from-[#579BE8] to-[#4a8dd8]",
      "from-[#579BE8] to-[#4a8dd8]",
      "from-[#579BE8] to-[#4a8dd8]",
      "from-[#579BE8] to-[#4a8dd8]",
    ];
    const safeIndex = index !== undefined && index !== null ? index : 0;
    return colors[safeIndex % colors.length];
  }, [index]);

  // Memoize rating stars
  const ratingValue = useMemo(() => Math.round(parseFloat(rating)), [rating]);

  // ✅ ثم استخدام badgeColor في الدوال التالية
  // Memoize card classes - using site color scheme
  const cardClasses = useMemo(() => {
    if (isOrderExpired) return "border-[#EF4444] bg-[#EF4444]/10 opacity-75";
    if (isInRoad)
      return "border-[#F59E0B] bg-[#F59E0B]/10 ring-2 ring-[#F59E0B] ring-opacity-50";
    if (isCancelled)
      return "border-[#EF4444] bg-[#EF4444]/10 ring-2 ring-[#EF4444] ring-opacity-50";
    if (isRejected)
      return "border-[#EF4444] bg-[#EF4444]/10 ring-2 ring-[#EF4444] ring-opacity-50";
    if (isPaid)
      return "border-[#10B981] bg-[#10B981]/10 ring-2 ring-[#10B981] ring-opacity-50";
    if (isAccepted) return "border-[#10B981] bg-[#10B981]/10";
    if (isPendingPayment)
      return "border-[#579BE8] bg-[#579BE8]/10 ring-2 ring-[#579BE8] ring-opacity-50";
    if (isExpired) return "border-[#EF4444] bg-[#EF4444]/10 opacity-75";
    if (isSelectedForPayment)
      return "border-[#579BE8] bg-[#579BE8]/10 ring-2 ring-[#579BE8] ring-opacity-50";
    if (isDelivered)
      return "border-[#10B981] bg-[#10B981]/10 ring-2 ring-[#10B981] ring-opacity-50";
    return "border-gray-200";
  }, [
    isAccepted,
    isPendingPayment,
    isExpired,
    isSelectedForPayment,
    isPaid,
    isDelivered,
    isCancelled,
    isRejected,
    isInRoad,
  ]);

  // Memoize header gradient
  const headerGradient = useMemo(() => {
    if (isInRoad) return "from-amber-50 to-orange-50";
    if (isCancelled) return "from-red-50 to-rose-50";
    if (isRejected) return "from-red-50 to-rose-50";
    if (isPaid) return "from-green-50 to-emerald-50";
    if (isAccepted) return "from-green-50 to-emerald-50";
    if (isPendingPayment) return "from-blue-50 to-indigo-50";
    if (isExpired) return "from-red-50 to-rose-50";
    if (isSelectedForPayment) return "from-blue-50 to-indigo-50";
    if (isDelivered) return "from-green-50 to-emerald-50";
    return "from-gray-50 to-gray-100";
  }, [
    isAccepted,
    isPendingPayment,
    isExpired,
    isSelectedForPayment,
    isPaid,
    isDelivered,
    isCancelled,
    isRejected,
    isInRoad,
  ]);

  // Memoize icon background
  const iconBg = useMemo(() => {
    if (isInRoad) return "bg-gradient-to-br from-amber-500 to-orange-600";
    if (isCancelled) return "bg-gradient-to-br from-red-500 to-rose-600";
    if (isRejected) return "bg-gradient-to-br from-red-500 to-rose-600";
    if (isPaid) return "bg-gradient-to-br from-green-500 to-emerald-600";
    if (isAccepted) return "bg-gradient-to-br from-green-500 to-emerald-600";
    if (isPendingPayment)
      return "bg-gradient-to-br from-[#579BE8] to-[#4a8dd8]";
    if (isExpired) return "bg-gradient-to-br from-red-500 to-rose-600";
    if (isSelectedForPayment)
      return "bg-gradient-to-br from-[#579BE8] to-[#4a8dd8]";
    if (isDelivered) return "bg-gradient-to-br from-green-500 to-emerald-600";

    return "bg-gradient-to-br from-blue-500 to-indigo-600";
  }, [
    isAccepted,
    isPendingPayment,
    isExpired,
    isSelectedForPayment,
    isPaid,
    isDelivered,
    isCancelled,
    isRejected,
    isInRoad,
  ]);

  // Memoize badge gradient - using site color scheme
  const badgeGradient = useMemo(() => {
    if (isInRoad) return "from-[#F59E0B] to-[#D97706]";
    if (isCancelled) return "from-[#EF4444] to-[#DC2626]";
    if (isRejected) return "from-[#EF4444] to-[#DC2626]";
    if (isPaid) return "from-[#10B981] to-[#059669]";
    if (isAccepted) return "from-[#10B981] to-[#059669]";
    if (isPendingPayment) return "from-[#579BE8] to-[#4a8dd8]";
    if (isExpired) return "from-[#EF4444] to-[#DC2626]";
    if (isSelectedForPayment) return "from-[#579BE8] to-[#4a8dd8]";
    if (isDelivered) return "from-[#10B981] to-[#059669]";
    return badgeColor; // ✅ الآن badgeColor معرفة
  }, [
    isAccepted,
    isPendingPayment,
    isExpired,
    isSelectedForPayment,
    isPaid,
    isDelivered,
    isCancelled,
    isRejected,
    isInRoad,
    badgeColor,
  ]);

  // Memoize button classes - using site color scheme
  const buttonClasses = useMemo(() => {
    if (isOrderExpired)
      return "bg-gradient-to-r from-[#EF4444] to-[#DC2626] text-white shadow-lg opacity-75 cursor-not-allowed";
    if (isInRoad)
      return "bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white shadow-lg cursor-default opacity-75";
    if (isCancelled)
      return "bg-gradient-to-r from-[#EF4444] to-[#DC2626] text-white shadow-lg cursor-default opacity-75";
    if (isRejected)
      return "bg-gradient-to-r from-[#EF4444] to-[#DC2626] text-white shadow-lg cursor-default opacity-75";
    if (isPaid)
      return "bg-gradient-to-r from-[#10B981] to-[#059669] text-white shadow-lg cursor-default";
    if (isAccepted)
      return "bg-gradient-to-r from-[#10B981] to-[#059669] text-white shadow-lg hover:from-[#059669] hover:to-[#047857]";
    if (isPendingPayment)
      return "bg-gradient-to-r from-[#579BE8] to-[#4a8dd8] text-white shadow-lg hover:from-[#4a8dd8] hover:to-[#3b7bc8] hover:shadow-xl transition-all cursor-pointer";
    if (isExpired)
      return "bg-gradient-to-r from-[#EF4444] to-[#DC2626] text-white shadow-lg opacity-75 cursor-not-allowed";
    if (isSelectedForPayment)
      return "bg-gradient-to-r from-[#579BE8] to-[#4a8dd8] text-white shadow-lg cursor-wait";
    if (isDelivered)
      return "bg-gradient-to-r from-[#10B981] to-[#059669] text-white shadow-lg cursor-default opacity-75";
    if (isPending)
      return "bg-gradient-to-r from-[#579BE8] to-[#4a8dd8] text-white shadow-lg hover:from-[#4a8dd8] hover:to-[#3b7bc8] hover:shadow-xl transition-all cursor-pointer";
    return "bg-gray-100 text-gray-400 cursor-not-allowed";
  }, [
    isAccepted,
    isPendingPayment,
    isExpired,
    isSelectedForPayment,
    isPaid,
    isDelivered,
    isPending,
    isCancelled,
    isRejected,
    isInRoad,
  ]);

  // نص الزر حسب الحالة
  const buttonText = useMemo(() => {
    if (isOrderExpired) return "انتهت صلاحية الطلب"; // ✅ نص جديد لحالة انتهاء الطلب
    if (accepting) return "جاري القبول...";
    if (isInRoad) return "السائق في الطريق";
    if (isCancelled) return "تم إلغاء الطلب";
    if (isRejected) return "تم رفض الطلب";
    if (isPaid) return "تم الدفع - الرحلة بدأت";
    if (isAccepted) return "تم قبول العرض";
    if (isPendingPayment) return "قبول العرض";
    if (isExpired) return "انتهت صلاحية العرض";
    if (isSelectedForPayment) return "جاري تجهيز الدفع...";
    if (isDelivered) return "تم التوصيل";
    if (isPending) return "قبول العرض";
    return "غير متاح";
  }, [
    accepting,
    isAccepted,
    isPendingPayment,
    isExpired,
    isSelectedForPayment,
    isPaid,
    isDelivered,
    isPending,
    isCancelled,
    isRejected,
    isInRoad,
  ]);

  return (
    <div
      className={`bg-white rounded-2xl shadow-lg border-2 overflow-hidden hover:shadow-xl transition-all duration-300 group h-full flex flex-col relative ${cardClasses}`}
    >
      <div className="">
        {/* Badge */}
        {index !== undefined && index !== null && (
          <div
            className={`absolute top-4 right-4 bg-gradient-to-r ${badgeGradient} text-white text-xs font-bold px-3 py-1 rounded-full z-20 shadow-lg`}
          >
            العرض #{index + 1}
          </div>
        )}

        {/* زر عرض الملف الشخصي - يختفي في حالات معينة */}
        <div className="absolute top-4 left-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewProfile();
            }}
            className="flex items-center flex-col text-[#579BE8] hover:text-[#4a8dd8] transition-all cursor-pointer"
            title="عرض الملف الشخصي"
          >
            <IoMdEye className="h-5 w-5" />
            <p className="md:text-sm font-medium text-xs">الملف </p>
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 flex-1 flex flex-col pt-12">
        {/* Row 1: Driver Avatar */}
        <div className="">
          <div className="relative flex justify-center">
            <img
              src={avatar || "/images/driver.png"}
              alt={name}
              className="w-24 h-24 md:w-22 md:h-22 rounded-full object-cover border-2 border-gray-200"
              onError={(e) => {
                e.target.src = "/images/driver.png";
              }}
            />
          </div>
        </div>

        {/* Row 2: Driver Name */}
        <h3 className="font-bold text-[#579BE8] text-xl mb-2 mt-1 text-center">
          {name}
        </h3>

        {/* Row 3: Delivery Time + Rating + Successful Orders */}
        <div className="flex items-center gap-3 mb-4 flex-wrap justify-center">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4 text-[#579BE8]" />
            <span className="text-sm font-medium text-[#579BE8]">
              يصل في {deliveryTime}
            </span>
          </div>
          <span className="text-sm font-medium text-gray-400">|</span>

          <div className="flex items-center gap-1">
            <FaStar className="w-4 h-4 text-[#579BE8]" />
            <p className="text-sm font-medium text-[#579BE8]">تقييم</p>
            <span className="text-sm font-bold text-[#579BE8]">{rating}</span>
          </div>
          <span className="text-sm font-medium text-gray-400">|</span>

          <div className="flex items-center gap-1">
            <LiaCertificateSolid className="w-4 h-4 text-[#579BE8]" />
            <span className="text-sm font-medium text-[#579BE8]">
              {successfulOrders}
            </span>
          </div>
        </div>

        {/* Row 4: Price + Riyal Icon */}
        <div className="flex items-center gap-2 mb-2 justify-center bg-[#579BE8]/10 rounded-lg py-1">
          <span className="font-bold text-[#579BE8] text-2xl">{price}</span>
          <Image src="/images/RS2.png" alt="ريال" width={20} height={20} />
        </div>

        {/* Row 5: Accept Button */}
        <div className="mt-auto">
          <button
            onClick={handleAccept}
            disabled={
              accepting ||
              isExpired ||
              isOrderExpired ||
              isSelectedForPayment ||
              isPaid ||
              isDelivered ||
              isCancelled ||
              isRejected ||
              isInRoad || // ✅ منع النقر في حالة في الطريق
              (!isPending && !isPendingPayment)
            }
            className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 ${buttonClasses}`}
          >
            {accepting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>{buttonText}</span>
              </>
            ) : (
              <>
                {isSelectedForPayment && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                {isDelivered && !isCancelled && !isRejected && (
                  <CheckCircle className="w-5 h-5" />
                )}
                {isCancelled && <X className="w-5 h-5" />}

                {isInRoad && <Truck className="w-5 h-5" />}
                <span>{buttonText}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
});

// ✅ تصدير كل من DriverCard و formatDriverData
export { DriverCard, formatDriverData };
export default DriverCard;
