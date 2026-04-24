'use server'

import { createClient } from '@/lib/supabase/server'

export async function seedSampleData(menuId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Verify menu belongs to user
  const { data: menu } = await supabase
    .from('menus').select('id').eq('id', menuId).eq('user_id', user.id).single()
  if (!menu) return { error: 'Menu not found' }

  const sampleData = [
    {
      name_my: 'အစပ်စားလျှောက်', name_en: 'Starters', sort_order: 0,
      items: [
        { name_my: 'ပါးပိုးစာ', name_en: 'Pā to soup', desc_my: 'Traditional Myanmar fritters', desc_en: 'Crispy lentil fritters', price: 1500, currency: 'MMK' },
        { name_my: 'အုန်းသီးပေါင်း', name_en: 'Coconut Pakora', desc_my: 'Coconut slices in chickpea batter', desc_en: 'Deep-fried coconut snacks', price: 2000, currency: 'MMK' },
        { name_my: 'ကြက်သားပေါင်း', name_en: 'Chicken Pakora', desc_my: 'Spiced chicken fritters', desc_en: 'Crispy spiced chicken bites', price: 2500, currency: 'MMK' },
      ]
    },
    {
      name_my: 'ဟင်းချို', name_en: 'Soups', sort_order: 1,
      items: [
        { name_my: 'မွှေးဟင်းချို', name_en: 'Mohinga', desc_my: 'Fish soup with rice noodles', desc_en: 'Myanmar\'s national dish - fish noodle soup', price: 3000, currency: 'MMK' },
        { name_my: 'ဆူးေခါက်ဟင်းချို', name_en: 'Shwe Taung Soup', desc_my: 'Pork rib soup with herbs', desc_en: 'Tender pork rib soup with local herbs', price: 3500, currency: 'MMK' },
        { name_my: 'နန်းကြီးဟင်းချို', name_en: 'Nan Gyi Thoh', desc_my: 'Chicken noodle soup', desc_en: 'Thick chicken noodle soup', price: 3000, currency: 'MMK' },
      ]
    },
    {
      name_my: 'ထမင်းဆိုင်', name_en: 'Rice Dishes', sort_order: 2,
      items: [
        { name_my: 'ထမင်းကြော်', name_en: 'Fried Rice', desc_my: 'Wok-fried rice with vegetables', desc_en: 'Classic fried rice with fresh veggies', price: 3500, currency: 'MMK' },
        { name_my: 'ဒန်းဟင်း', name_en: 'Dan Htamin', desc_my: 'Oil rice', desc_en: 'Fried rice cooked in oil', price: 3000, currency: 'MMK' },
        { name_my: 'မုန့်ဟင်းချိုထမင်း', name_en: 'Rice & Soup Set', desc_my: 'Rice with mohinga soup', desc_en: 'Steamed rice with mohinga', price: 4000, currency: 'MMK' },
      ]
    },
    {
      name_my: 'သောက်စရာ', name_en: 'Drinks', sort_order: 3,
      items: [
        { name_my: 'လက်ဖက်ရည်', name_en: 'Laphet Yay', desc_my: 'Burmese green tea', desc_en: 'Traditional salted green tea', price: 500, currency: 'MMK' },
        { name_my: 'သူငယ်ချင်းရည်', name_en: 'Htamin Let Sa', desc_my: 'Cold rice tea', desc_en: 'Chilled rice tea drink', price: 800, currency: 'MMK' },
        { name_my: 'သံလက်ကြံရည်', name_en: 'Palm Sugar Juice', desc_my: 'Fresh palm sugar drink', desc_en: 'Sweet palm sugar refreshment', price: 1000, currency: 'MMK' },
        { name_my: 'ရေသန့်', name_en: 'Drinking Water', desc_my: 'Purified water', desc_en: 'Bottled purified water', price: 500, currency: 'MMK' },
      ]
    },
    {
      name_my: 'မုန့်တီး', name_en: 'Desserts', sort_order: 4,
      items: [
        { name_my: 'မုန့်ထောပတ်', name_en: 'Mont Lone Yay Paw', desc_my: 'Glutinous rice balls in coconut milk', desc_en: 'Sweet sticky rice balls in coconut cream', price: 1500, currency: 'MMK' },
        { name_my: 'ရှမ်းပိုင်း', name_en: 'Shan Paan', desc_my: 'Shan style glutinous rice cakes', desc_en: 'Traditional Shan rice cakes', price: 2000, currency: 'MMK' },
      ]
    },
  ]

  // Insert categories and items
  for (const cat of sampleData) {
    const { data: category, error: catError } = await supabase
      .from('menu_categories')
      .insert({ menu_id: menuId, name_my: cat.name_my, name_en: cat.name_en, sort_order: cat.sort_order })
      .select().single()

    if (catError || !category) continue

    const itemsToInsert = cat.items.map((item, idx) => ({
      category_id: category.id,
      name_my: item.name_my,
      name_en: item.name_en,
      description_my: item.desc_my,
      description_en: item.desc_en,
      price: item.price,
      currency: item.currency,
      sort_order: idx,
      is_available: true,
    }))

    await supabase.from('menu_items').insert(itemsToInsert)
  }

  return { success: true }
}
