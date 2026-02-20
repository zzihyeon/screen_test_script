import * as t from "@babel/types";
import type { File } from "@babel/types";
import type { NodePath } from "@babel/traverse";
import { traverse } from "../parser/traverse.js";
import type { ImportMap } from "../types/core.js";

export function buildImportMap(ast: File | null): ImportMap {
  const bindings = new Map<string, { local: string; source: string; imported: string }>();
  if (!ast) {
    return { bindings };
  }

  traverse(ast, {
    ImportDeclaration(path: NodePath<t.ImportDeclaration>) {
      const source = path.node.source.value;
      for (const spec of path.node.specifiers) {
        if (t.isImportDefaultSpecifier(spec)) {
          bindings.set(spec.local.name, {
            local: spec.local.name,
            source,
            imported: "default"
          });
        } else if (t.isImportNamespaceSpecifier(spec)) {
          bindings.set(spec.local.name, {
            local: spec.local.name,
            source,
            imported: "*"
          });
        } else if (t.isImportSpecifier(spec)) {
          const imported = t.isIdentifier(spec.imported)
            ? spec.imported.name
            : spec.imported.value;
          bindings.set(spec.local.name, {
            local: spec.local.name,
            source,
            imported
          });
        }
      }
    },
    VariableDeclarator(path: NodePath<t.VariableDeclarator>) {
      const init = path.node.init;
      if (!init || !t.isCallExpression(init)) {
        return;
      }
      if (!t.isIdentifier(init.callee) || init.callee.name !== "require") {
        return;
      }
      const firstArg = init.arguments[0];
      if (!firstArg || !t.isStringLiteral(firstArg)) {
        return;
      }
      const source = firstArg.value;
      if (t.isIdentifier(path.node.id)) {
        bindings.set(path.node.id.name, {
          local: path.node.id.name,
          source,
          imported: "default"
        });
      } else if (t.isObjectPattern(path.node.id)) {
        for (const prop of path.node.id.properties) {
          if (t.isObjectProperty(prop) && t.isIdentifier(prop.key) && t.isIdentifier(prop.value)) {
            bindings.set(prop.value.name, {
              local: prop.value.name,
              source,
              imported: prop.key.name
            });
          }
        }
      }
    }
  });

  return { bindings };
}
