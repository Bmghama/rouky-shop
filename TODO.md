# TODO - Rouky Shop (Admin performance + Tailwind v4 + Mobile)

## Étapes
- [x] 1) Corriger Tailwind v4 dans `src/App.tsx` (patterns: !text-[..], flex-shrink, h-[1px], bg-gradient-to-t -> bg-linear-to-t, break-words -> wrap-break-word)
- [x] 2) Corriger Tailwind v4 dans `src/components/admin/AdminLayout.tsx`
- [ ] 3) Corriger Tailwind v4 dans `src/components/admin/Dashboard.tsx`

- [ ] 4) Stabiliser la logique de fetch dans `Dashboard.tsx` (useCallback/useEffect, anti-double-fetch, fallback mock data)
- [ ] 5) Transformer les tables en “cartes verticales” mobile dans `Dashboard.tsx` :
  - [ ] 5.1 ProductsView
  - [ ] 5.2 OrdersView
  - [ ] 5.3 ReviewsView
  - [ ] 5.4 NewsletterView
- [ ] 6) Ajouter/assurer un spinner léger et non-bloquant en état `loading`
- [ ] 7) Lancer `npm run build` (ou tests si existants) et vérifier l’admin + mobile

