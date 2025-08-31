// --- add near the top with other imports ---
import mongoose from 'mongoose';

// --- below your existing GET / (list) route, add: ---
// GET /api/products/search?q=...&category=...&sort=priceAsc|priceDesc|newest&page=1&limit=12
router.get('/search', async (req, res) => {
  try {
    const {
      q = '',
      category = '',
      sort = 'newest',
      page = '1',
      limit = '12',
    } = req.query;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const perPage = Math.min(Math.max(parseInt(limit, 10) || 12, 1), 100);

    const filter = {};
    if (category) filter.category = category;
    if (q) {
      const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ title: rx }, { description: rx }];
    }

    // sort mapping
    const sortMap = {
      priceAsc: { price: 1 },
      priceDesc: { price: -1 },
      newest: { createdAt: -1 },
    };
    const sortSpec = sortMap[sort] || sortMap.newest;

    const [items, total] = await Promise.all([
      Product.find(filter)
        .sort(sortSpec)
        .skip((pageNum - 1) * perPage)
        .limit(perPage),
      Product.countDocuments(filter),
    ]);

    const pages = Math.max(Math.ceil(total / perPage), 1);
    res.json({ items, total, page: pageNum, pages });
  } catch (e) {
    res.status(500).json({ message: 'Search failed' });
  }
});
