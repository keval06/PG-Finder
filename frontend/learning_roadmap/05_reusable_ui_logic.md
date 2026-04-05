# Level 5: Reusable UI & Logic (Components & Cards)

This level covers the "Middle Layer" of components — bigger than Atoms, but smaller than full Pages. These are the building blocks you see on almost every screen.

## 🏗️ Shareable Components (`components/`)

These components manage specific UI groups and often take complex "Objects" as props.

| Component | Responsibility | Technical Concept |
| :--- | :--- | :--- |
| `components/Navbar.jsx` | Nav, Global Search, Profile dropdown. | **Global Context Consumer** |
| `components/PGCard.jsx` | The "Standard" browse card for a single PG. | **Prop-driven UI Rendering** |
| `components/StatusBadge.jsx` | Booking/Payment status pills. | **Config Object Pattern** |
| `components/ConfirmModal.jsx` | Standardized dangerous-action dialog. | **Portals & Z-Index Layering** |
| `components/PaginationWrapper.jsx` | Handles splitting lists into pages. | **Dual-Mode Pagination** |

---

## 🖼️ `components/PGCard.jsx` — Deep Dive (Mini-Gallery & Lightbox)

This component has been significantly updated with a "Mini Gallery" feature.

### 1. The Local Gallery State
Instead of showing just one static image, the card now lets users cycle through images directly in the list view.
- **Logic**: `const [cardIdx, setCardIdx] = useState(0)`. 
- **Wrapping Math**: `(i + 1) % images.length` ensures that when you reach the last image, it wraps back to the first one.

### 2. Event Bubbling (`stopPropagation`)
The card is wrapped in a `<Link>` to the detail page.
- **Problem**: Clicking the gallery arrow would also trigger the link, navigating the user away.
- **Solution**: `e.preventDefault(); e.stopPropagation();`. This "clips" the event so it only triggers the slider, not the link.

### 3. The Full-Screen Lightbox
Clicking the "Expand" icon opens a high-res lightbox overlay.
- **Body Lock**: `document.body.style.overflow = "hidden"` prevents the main page from scrolling while the lightbox is open.
- **Keyboard Hook**: A `useEffect` listens for `Escape`, `ArrowLeft`, and `ArrowRight` keys to make navigation natural for desktop users.

---

## 🎨 `components/StatusBadge.jsx` — The Config Pattern
This component uses a **Mapping Object** to avoid messy `if/else` ladders.
```javascript
const STATUS_CONFIG = {
  confirmed: { badge: "bg-emerald-50 text-emerald-700", label: "Confirmed" },
  pending:   { badge: "bg-amber-50  text-amber-700",  label: "Pending" },
  //...
};
```
- **Why?** It's "Declarative Design." To add a new status like `completed`, you just add one line to the object. No logic changes needed.

**Next Stop: [Level 6: Feature Hub - Home](06_home_hub.md)**
