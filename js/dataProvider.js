import { SUPABASE_URL, SUPABASE_KEY } from './config.js';

export const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// بيانات واقعية أولية واحترافية للمطعم تظهر فوراً لإبهار الجميع
const fallbackSettings = {
    restaurant_name: "كاستيللو ريستوراند | Castello Restaurant",
    working_hours: "12:00 PM - 01:00 AM",
    address: "سوريا - الباب - المربع الملكي",
    google_maps_link: "https://maps.google.com",
    cover_url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200",
    whatsapp_number: "963955555555"
};

const fallbackCategories = [
    { id: 1, name: "برغرات ملكية 🍔" },
    { id: 2, name: "ستيك ومشاوي فاخرة 🍢" },
    { id: 3, name: "مقبلات كاستيللو الخاصة 🥗" }
];

const fallbackMeals = [
    { id: 101, category_id: 1, title: "برغر كاستيللو الترفل الملكي", price: 75000, description: "لحم أنغوس مشوي على اللهب، شرائح فطر الترفل الأسود الفاخر، جبنة غاودا معتقة بصلصة خاصة.", image_url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500" },
    { id: 102, category_id: 1, title: "جراند كريسبي تشيكن سبريم", price: 60000, description: "صدر دجاج مقرمش متبل لمدة 48 ساعة، مغطى بصلصة الرانش المدخنة وسلطة الملفوف الغنية.", image_url: "https://images.unsplash.com/photo-1562967914-608f82629710?w=500" },
    { id: 103, category_id: 2, title: "جراند ميكس جريل كاستيللو", price: 195000, description: "تشكيلة أرستقراطية من شقف الكباب الحلبي، ريش الغنم المتبلة، والشيش طاووق الفاخر على الفحم.", image_url: "https://images.unsplash.com/photo-1544025162-d76694265947?w=500" },
    { id: 104, category_id: 3, title: "سلطة السيزر الإمبراطورية", price: 35000, description: "خس روماني مقرمش، قطع دجاج فيليه مشوي، جبنة بارميزان ريجيانو، خبز كروتون بالثوم والأعشاب.", image_url: "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=500" }
];

export async function getRestaurantSettings() {
    try {
        const { data, error } = await supabaseClient.from('restaurant_settings').select('*').eq('id', 1).single();
        if (error || !data) return fallbackSettings;
        return data;
    } catch { return fallbackSettings; }
}

export async function getCategories() {
    try {
        const { data, error } = await supabaseClient.from('categories').select('*').order('id', { ascending: true });
        if (error || !data || data.length === 0) return fallbackCategories;
        return data;
    } catch { return fallbackCategories; }
}

export async function getMeals(categoryId = null) {
    try {
        const { data, error } = await supabaseClient.from('meals').select('*').order('id', { ascending: false });
        let list = (error || !data || data.length === 0) ? fallbackMeals : data;
        if (categoryId) return list.filter(m => m.category_id == categoryId);
        return list;
    } catch {
        if (categoryId) return fallbackMeals.filter(m => m.category_id == categoryId);
        return fallbackMeals;
    }
}