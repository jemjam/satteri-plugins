# @jemjam/tsconfig

Private shared TypeScript settings for the workspace's libraries, based on the
existing `vp create vite:library` defaults. No build step is required.

Add `@jemjam/tsconfig` as a `workspace:*` development dependency, then extend:

```json
{
  "extends": "@jemjam/tsconfig/library.json",
  "compilerOptions": {
    "types": ["node"]
  }
}
```

Keep environment types, file inclusion, and path settings in the consuming
package. The library preset supplies strict checking, NodeNext modules, and
no-emit checking; `vp pack` handles JavaScript and declaration output.
