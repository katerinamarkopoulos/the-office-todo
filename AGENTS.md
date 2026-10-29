<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep public registration at `/` and `/auth`, and the private board at `/office` under the Cloud auth gate, so private content never appears before sign-in.
- Store each user's name and preset avatar ID in `profiles`, and their task/note document in `office_state` with owner-only RLS; never load shared localStorage data into accounts automatically.
- Keep the board as a presentation component with injected initial data and change callbacks, so UI tests stay independent of hosted authentication.
- Serialize document saves and wait before sign-out, so rapid note edits cannot overwrite later changes.
- Use the shared avatar picker at registration and in profile editing; store only a validated preset ID and render its CDN asset with object-contain to keep every supplied subject visible.
