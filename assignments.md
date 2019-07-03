# Assignments

This table illustrates which types can be assigned to each other.

Each cell shows if the assignment `typeA = typeB` is valid.

    ## Assignments with strict options:

| typeB ➡️<br />typeA ⬇️ | true | false | boolean | 123 | number | "foo" | string | undefined | null | 111n | BigInt | never | void | any | unknown | {}  |
| ---------------------- | ---- | ----- | ------- | --- | ------ | ----- | ------ | --------- | ---- | ---- | ------ | ----- | ---- | --- | ------- | --- |
| true                   | ✅   | ❌    | ❌      | ❌  | ❌     | ❌    | ❌     | ❌        | ❌   | ❌   | ❌     | ✅    | ❌   | ✅  | ❌      | ❌  |
| false                  | ❌   | ✅    | ❌      | ❌  | ❌     | ❌    | ❌     | ❌        | ❌   | ❌   | ❌     | ✅    | ❌   | ✅  | ❌      | ❌  |
| boolean                | ✅   | ✅    | ✅      | ❌  | ❌     | ❌    | ❌     | ❌        | ❌   | ❌   | ❌     | ✅    | ❌   | ✅  | ❌      | ❌  |
| 123                    | ❌   | ❌    | ❌      | ✅  | ❌     | ❌    | ❌     | ❌        | ❌   | ❌   | ❌     | ✅    | ❌   | ✅  | ❌      | ❌  |
| number                 | ❌   | ❌    | ❌      | ✅  | ✅     | ❌    | ❌     | ❌        | ❌   | ❌   | ❌     | ✅    | ❌   | ✅  | ❌      | ❌  |
| "foo"                  | ❌   | ❌    | ❌      | ❌  | ❌     | ✅    | ❌     | ❌        | ❌   | ❌   | ❌     | ✅    | ❌   | ✅  | ❌      | ❌  |
| string                 | ❌   | ❌    | ❌      | ❌  | ❌     | ✅    | ✅     | ❌        | ❌   | ❌   | ❌     | ✅    | ❌   | ✅  | ❌      | ❌  |
| undefined              | ❌   | ❌    | ❌      | ❌  | ❌     | ❌    | ❌     | ✅        | ❌   | ❌   | ❌     | ✅    | ❌   | ✅  | ❌      | ❌  |
| null                   | ❌   | ❌    | ❌      | ❌  | ❌     | ❌    | ❌     | ❌        | ✅   | ❌   | ❌     | ✅    | ❌   | ✅  | ❌      | ❌  |
| 111n                   | ❌   | ❌    | ❌      | ❌  | ❌     | ❌    | ❌     | ❌        | ❌   | ✅   | ❌     | ✅    | ❌   | ✅  | ❌      | ❌  |
| BigInt                 | ❌   | ❌    | ❌      | ❌  | ❌     | ❌    | ❌     | ❌        | ❌   | ✅   | ✅     | ✅    | ❌   | ✅  | ❌      | ❌  |
| never                  | ❌   | ❌    | ❌      | ❌  | ❌     | ❌    | ❌     | ❌        | ❌   | ❌   | ❌     | ✅    | ❌   | ❌  | ❌      | ❌  |
| void                   | ❌   | ❌    | ❌      | ❌  | ❌     | ❌    | ❌     | ✅        | ❌   | ❌   | ❌     | ✅    | ✅   | ✅  | ❌      | ❌  |
| any                    | ✅   | ✅    | ✅      | ✅  | ✅     | ✅    | ✅     | ✅        | ✅   | ✅   | ✅     | ✅    | ✅   | ✅  | ✅      | ✅  |
| unknown                | ✅   | ✅    | ✅      | ✅  | ✅     | ✅    | ✅     | ✅        | ✅   | ✅   | ✅     | ✅    | ✅   | ✅  | ✅      | ✅  |
| {}                     | ✅   | ✅    | ✅      | ✅  | ✅     | ✅    | ✅     | ❌        | ❌   | ✅   | ✅     | ✅    | ❌   | ✅  | ❌      | ✅  |

    ## Assignments with non-strict options:

| typeB ➡️<br />typeA ⬇️ | true | false | boolean | 123 | number | "foo" | string | undefined | null | 111n | BigInt | never | void | any | unknown | {}  |
| ---------------------- | ---- | ----- | ------- | --- | ------ | ----- | ------ | --------- | ---- | ---- | ------ | ----- | ---- | --- | ------- | --- |
| true                   | ✅   | ❌    | ❌      | ❌  | ❌     | ❌    | ❌     | ✅        | ✅   | ❌   | ❌     | ✅    | ❌   | ✅  | ❌      | ❌  |
| false                  | ❌   | ✅    | ❌      | ❌  | ❌     | ❌    | ❌     | ✅        | ✅   | ❌   | ❌     | ✅    | ❌   | ✅  | ❌      | ❌  |
| boolean                | ✅   | ✅    | ✅      | ❌  | ❌     | ❌    | ❌     | ✅        | ✅   | ❌   | ❌     | ✅    | ❌   | ✅  | ❌      | ❌  |
| 123                    | ❌   | ❌    | ❌      | ✅  | ❌     | ❌    | ❌     | ✅        | ✅   | ❌   | ❌     | ✅    | ❌   | ✅  | ❌      | ❌  |
| number                 | ❌   | ❌    | ❌      | ✅  | ✅     | ❌    | ❌     | ✅        | ✅   | ❌   | ❌     | ✅    | ❌   | ✅  | ❌      | ❌  |
| "foo"                  | ❌   | ❌    | ❌      | ❌  | ❌     | ✅    | ❌     | ✅        | ✅   | ❌   | ❌     | ✅    | ❌   | ✅  | ❌      | ❌  |
| string                 | ❌   | ❌    | ❌      | ❌  | ❌     | ✅    | ✅     | ✅        | ✅   | ❌   | ❌     | ✅    | ❌   | ✅  | ❌      | ❌  |
| undefined              | ❌   | ❌    | ❌      | ❌  | ❌     | ❌    | ❌     | ✅        | ✅   | ❌   | ❌     | ✅    | ❌   | ✅  | ❌      | ❌  |
| null                   | ❌   | ❌    | ❌      | ❌  | ❌     | ❌    | ❌     | ✅        | ✅   | ❌   | ❌     | ✅    | ❌   | ✅  | ❌      | ❌  |
| 111n                   | ❌   | ❌    | ❌      | ❌  | ❌     | ❌    | ❌     | ✅        | ✅   | ✅   | ❌     | ✅    | ❌   | ✅  | ❌      | ❌  |
| BigInt                 | ❌   | ❌    | ❌      | ❌  | ❌     | ❌    | ❌     | ✅        | ✅   | ✅   | ✅     | ✅    | ❌   | ✅  | ❌      | ❌  |
| never                  | ❌   | ❌    | ❌      | ❌  | ❌     | ❌    | ❌     | ❌        | ❌   | ❌   | ❌     | ✅    | ❌   | ❌  | ❌      | ❌  |
| void                   | ❌   | ❌    | ❌      | ❌  | ❌     | ❌    | ❌     | ✅        | ✅   | ❌   | ❌     | ✅    | ✅   | ✅  | ❌      | ❌  |
| any                    | ✅   | ✅    | ✅      | ✅  | ✅     | ✅    | ✅     | ✅        | ✅   | ✅   | ✅     | ✅    | ✅   | ✅  | ✅      | ✅  |
| unknown                | ✅   | ✅    | ✅      | ✅  | ✅     | ✅    | ✅     | ✅        | ✅   | ✅   | ✅     | ✅    | ✅   | ✅  | ✅      | ✅  |
| {}                     | ✅   | ✅    | ✅      | ✅  | ✅     | ✅    | ✅     | ✅        | ✅   | ✅   | ✅     | ✅    | ❌   | ✅  | ❌      | ✅  |