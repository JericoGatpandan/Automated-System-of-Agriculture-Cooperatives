Read `GEMINI.md` before starting.

We're adding the design system and UI primitive components.

`shadcn/ui` is already installed.

The current configuration is set to use the **Maia** preset, which applies a light theme by default.
read the `context/ui-context.md` for more information
make sure that the shadcn components are using the css variables from `context/ui-context.md` and that `frontend/src/App.css` is using the css variables from `context/ui-context.md`

Add these shadcn components:

- Button
- Card
- Dialog
- Input
- Tabs
- Textarea
- ScrollArea
- and other that will be needed in this project

Do not modify the generated `components/ui/*` files after installation.

Also Install `lucide-react`.

Create `lib/utils.ts` with a reusable `cn()` helper for merging Tailwind classes.

Ensure all components match the existing dark theme in `globals.css`.

### Check when done

- All components import without errors
- `cn()` works properly
- No default light styling appears
