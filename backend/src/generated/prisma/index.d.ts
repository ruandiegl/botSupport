
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model Department
 * 
 */
export type Department = $Result.DefaultSelection<Prisma.$DepartmentPayload>
/**
 * Model Procedure
 * 
 */
export type Procedure = $Result.DefaultSelection<Prisma.$ProcedurePayload>
/**
 * Model Agent
 * 
 */
export type Agent = $Result.DefaultSelection<Prisma.$AgentPayload>
/**
 * Model RolePermission
 * 
 */
export type RolePermission = $Result.DefaultSelection<Prisma.$RolePermissionPayload>
/**
 * Model Contact
 * 
 */
export type Contact = $Result.DefaultSelection<Prisma.$ContactPayload>
/**
 * Model Conversation
 * 
 */
export type Conversation = $Result.DefaultSelection<Prisma.$ConversationPayload>
/**
 * Model Message
 * 
 */
export type Message = $Result.DefaultSelection<Prisma.$MessagePayload>
/**
 * Model FlowDefinition
 * 
 */
export type FlowDefinition = $Result.DefaultSelection<Prisma.$FlowDefinitionPayload>
/**
 * Model ZApiConfig
 * 
 */
export type ZApiConfig = $Result.DefaultSelection<Prisma.$ZApiConfigPayload>
/**
 * Model Shortcut
 * 
 */
export type Shortcut = $Result.DefaultSelection<Prisma.$ShortcutPayload>
/**
 * Model ShortcutAudit
 * 
 */
export type ShortcutAudit = $Result.DefaultSelection<Prisma.$ShortcutAuditPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const ShortcutType: {
  GREETING: 'GREETING',
  CLOSING: 'CLOSING',
  DEPARTMENT: 'DEPARTMENT',
  PERSONAL: 'PERSONAL',
  GENERAL: 'GENERAL'
};

export type ShortcutType = (typeof ShortcutType)[keyof typeof ShortcutType]


export const ShortcutScope: {
  GLOBAL: 'GLOBAL',
  DEPARTMENT: 'DEPARTMENT',
  PERSONAL: 'PERSONAL'
};

export type ShortcutScope = (typeof ShortcutScope)[keyof typeof ShortcutScope]

}

export type ShortcutType = $Enums.ShortcutType

export const ShortcutType: typeof $Enums.ShortcutType

export type ShortcutScope = $Enums.ShortcutScope

export const ShortcutScope: typeof $Enums.ShortcutScope

/**
 * ##  Prisma Client ʲˢ
 * 
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Departments
 * const departments = await prisma.department.findMany()
 * ```
 *
 * 
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   * 
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Departments
   * const departments = await prisma.department.findMany()
   * ```
   *
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): void;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb, ExtArgs>

      /**
   * `prisma.department`: Exposes CRUD operations for the **Department** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Departments
    * const departments = await prisma.department.findMany()
    * ```
    */
  get department(): Prisma.DepartmentDelegate<ExtArgs>;

  /**
   * `prisma.procedure`: Exposes CRUD operations for the **Procedure** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Procedures
    * const procedures = await prisma.procedure.findMany()
    * ```
    */
  get procedure(): Prisma.ProcedureDelegate<ExtArgs>;

  /**
   * `prisma.agent`: Exposes CRUD operations for the **Agent** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Agents
    * const agents = await prisma.agent.findMany()
    * ```
    */
  get agent(): Prisma.AgentDelegate<ExtArgs>;

  /**
   * `prisma.rolePermission`: Exposes CRUD operations for the **RolePermission** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more RolePermissions
    * const rolePermissions = await prisma.rolePermission.findMany()
    * ```
    */
  get rolePermission(): Prisma.RolePermissionDelegate<ExtArgs>;

  /**
   * `prisma.contact`: Exposes CRUD operations for the **Contact** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Contacts
    * const contacts = await prisma.contact.findMany()
    * ```
    */
  get contact(): Prisma.ContactDelegate<ExtArgs>;

  /**
   * `prisma.conversation`: Exposes CRUD operations for the **Conversation** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Conversations
    * const conversations = await prisma.conversation.findMany()
    * ```
    */
  get conversation(): Prisma.ConversationDelegate<ExtArgs>;

  /**
   * `prisma.message`: Exposes CRUD operations for the **Message** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Messages
    * const messages = await prisma.message.findMany()
    * ```
    */
  get message(): Prisma.MessageDelegate<ExtArgs>;

  /**
   * `prisma.flowDefinition`: Exposes CRUD operations for the **FlowDefinition** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more FlowDefinitions
    * const flowDefinitions = await prisma.flowDefinition.findMany()
    * ```
    */
  get flowDefinition(): Prisma.FlowDefinitionDelegate<ExtArgs>;

  /**
   * `prisma.zApiConfig`: Exposes CRUD operations for the **ZApiConfig** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ZApiConfigs
    * const zApiConfigs = await prisma.zApiConfig.findMany()
    * ```
    */
  get zApiConfig(): Prisma.ZApiConfigDelegate<ExtArgs>;

  /**
   * `prisma.shortcut`: Exposes CRUD operations for the **Shortcut** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Shortcuts
    * const shortcuts = await prisma.shortcut.findMany()
    * ```
    */
  get shortcut(): Prisma.ShortcutDelegate<ExtArgs>;

  /**
   * `prisma.shortcutAudit`: Exposes CRUD operations for the **ShortcutAudit** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ShortcutAudits
    * const shortcutAudits = await prisma.shortcutAudit.findMany()
    * ```
    */
  get shortcutAudit(): Prisma.ShortcutAuditDelegate<ExtArgs>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError
  export import NotFoundError = runtime.NotFoundError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics 
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 5.22.0
   * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion 

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? K : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    Department: 'Department',
    Procedure: 'Procedure',
    Agent: 'Agent',
    RolePermission: 'RolePermission',
    Contact: 'Contact',
    Conversation: 'Conversation',
    Message: 'Message',
    FlowDefinition: 'FlowDefinition',
    ZApiConfig: 'ZApiConfig',
    Shortcut: 'Shortcut',
    ShortcutAudit: 'ShortcutAudit'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb extends $Utils.Fn<{extArgs: $Extensions.InternalArgs, clientOptions: PrismaClientOptions }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], this['params']['clientOptions']>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, ClientOptions = {}> = {
    meta: {
      modelProps: "department" | "procedure" | "agent" | "rolePermission" | "contact" | "conversation" | "message" | "flowDefinition" | "zApiConfig" | "shortcut" | "shortcutAudit"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Department: {
        payload: Prisma.$DepartmentPayload<ExtArgs>
        fields: Prisma.DepartmentFieldRefs
        operations: {
          findUnique: {
            args: Prisma.DepartmentFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DepartmentPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.DepartmentFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DepartmentPayload>
          }
          findFirst: {
            args: Prisma.DepartmentFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DepartmentPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.DepartmentFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DepartmentPayload>
          }
          findMany: {
            args: Prisma.DepartmentFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DepartmentPayload>[]
          }
          create: {
            args: Prisma.DepartmentCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DepartmentPayload>
          }
          createMany: {
            args: Prisma.DepartmentCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.DepartmentCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DepartmentPayload>[]
          }
          delete: {
            args: Prisma.DepartmentDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DepartmentPayload>
          }
          update: {
            args: Prisma.DepartmentUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DepartmentPayload>
          }
          deleteMany: {
            args: Prisma.DepartmentDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.DepartmentUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.DepartmentUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DepartmentPayload>
          }
          aggregate: {
            args: Prisma.DepartmentAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateDepartment>
          }
          groupBy: {
            args: Prisma.DepartmentGroupByArgs<ExtArgs>
            result: $Utils.Optional<DepartmentGroupByOutputType>[]
          }
          count: {
            args: Prisma.DepartmentCountArgs<ExtArgs>
            result: $Utils.Optional<DepartmentCountAggregateOutputType> | number
          }
        }
      }
      Procedure: {
        payload: Prisma.$ProcedurePayload<ExtArgs>
        fields: Prisma.ProcedureFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ProcedureFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcedurePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ProcedureFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcedurePayload>
          }
          findFirst: {
            args: Prisma.ProcedureFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcedurePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ProcedureFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcedurePayload>
          }
          findMany: {
            args: Prisma.ProcedureFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcedurePayload>[]
          }
          create: {
            args: Prisma.ProcedureCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcedurePayload>
          }
          createMany: {
            args: Prisma.ProcedureCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ProcedureCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcedurePayload>[]
          }
          delete: {
            args: Prisma.ProcedureDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcedurePayload>
          }
          update: {
            args: Prisma.ProcedureUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcedurePayload>
          }
          deleteMany: {
            args: Prisma.ProcedureDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ProcedureUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ProcedureUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcedurePayload>
          }
          aggregate: {
            args: Prisma.ProcedureAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateProcedure>
          }
          groupBy: {
            args: Prisma.ProcedureGroupByArgs<ExtArgs>
            result: $Utils.Optional<ProcedureGroupByOutputType>[]
          }
          count: {
            args: Prisma.ProcedureCountArgs<ExtArgs>
            result: $Utils.Optional<ProcedureCountAggregateOutputType> | number
          }
        }
      }
      Agent: {
        payload: Prisma.$AgentPayload<ExtArgs>
        fields: Prisma.AgentFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AgentFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgentPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AgentFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgentPayload>
          }
          findFirst: {
            args: Prisma.AgentFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgentPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AgentFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgentPayload>
          }
          findMany: {
            args: Prisma.AgentFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgentPayload>[]
          }
          create: {
            args: Prisma.AgentCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgentPayload>
          }
          createMany: {
            args: Prisma.AgentCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AgentCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgentPayload>[]
          }
          delete: {
            args: Prisma.AgentDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgentPayload>
          }
          update: {
            args: Prisma.AgentUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgentPayload>
          }
          deleteMany: {
            args: Prisma.AgentDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AgentUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.AgentUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgentPayload>
          }
          aggregate: {
            args: Prisma.AgentAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAgent>
          }
          groupBy: {
            args: Prisma.AgentGroupByArgs<ExtArgs>
            result: $Utils.Optional<AgentGroupByOutputType>[]
          }
          count: {
            args: Prisma.AgentCountArgs<ExtArgs>
            result: $Utils.Optional<AgentCountAggregateOutputType> | number
          }
        }
      }
      RolePermission: {
        payload: Prisma.$RolePermissionPayload<ExtArgs>
        fields: Prisma.RolePermissionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.RolePermissionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RolePermissionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.RolePermissionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RolePermissionPayload>
          }
          findFirst: {
            args: Prisma.RolePermissionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RolePermissionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.RolePermissionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RolePermissionPayload>
          }
          findMany: {
            args: Prisma.RolePermissionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RolePermissionPayload>[]
          }
          create: {
            args: Prisma.RolePermissionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RolePermissionPayload>
          }
          createMany: {
            args: Prisma.RolePermissionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.RolePermissionCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RolePermissionPayload>[]
          }
          delete: {
            args: Prisma.RolePermissionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RolePermissionPayload>
          }
          update: {
            args: Prisma.RolePermissionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RolePermissionPayload>
          }
          deleteMany: {
            args: Prisma.RolePermissionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.RolePermissionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.RolePermissionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RolePermissionPayload>
          }
          aggregate: {
            args: Prisma.RolePermissionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateRolePermission>
          }
          groupBy: {
            args: Prisma.RolePermissionGroupByArgs<ExtArgs>
            result: $Utils.Optional<RolePermissionGroupByOutputType>[]
          }
          count: {
            args: Prisma.RolePermissionCountArgs<ExtArgs>
            result: $Utils.Optional<RolePermissionCountAggregateOutputType> | number
          }
        }
      }
      Contact: {
        payload: Prisma.$ContactPayload<ExtArgs>
        fields: Prisma.ContactFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ContactFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ContactPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ContactFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ContactPayload>
          }
          findFirst: {
            args: Prisma.ContactFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ContactPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ContactFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ContactPayload>
          }
          findMany: {
            args: Prisma.ContactFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ContactPayload>[]
          }
          create: {
            args: Prisma.ContactCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ContactPayload>
          }
          createMany: {
            args: Prisma.ContactCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ContactCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ContactPayload>[]
          }
          delete: {
            args: Prisma.ContactDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ContactPayload>
          }
          update: {
            args: Prisma.ContactUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ContactPayload>
          }
          deleteMany: {
            args: Prisma.ContactDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ContactUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ContactUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ContactPayload>
          }
          aggregate: {
            args: Prisma.ContactAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateContact>
          }
          groupBy: {
            args: Prisma.ContactGroupByArgs<ExtArgs>
            result: $Utils.Optional<ContactGroupByOutputType>[]
          }
          count: {
            args: Prisma.ContactCountArgs<ExtArgs>
            result: $Utils.Optional<ContactCountAggregateOutputType> | number
          }
        }
      }
      Conversation: {
        payload: Prisma.$ConversationPayload<ExtArgs>
        fields: Prisma.ConversationFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ConversationFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConversationPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ConversationFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConversationPayload>
          }
          findFirst: {
            args: Prisma.ConversationFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConversationPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ConversationFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConversationPayload>
          }
          findMany: {
            args: Prisma.ConversationFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConversationPayload>[]
          }
          create: {
            args: Prisma.ConversationCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConversationPayload>
          }
          createMany: {
            args: Prisma.ConversationCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ConversationCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConversationPayload>[]
          }
          delete: {
            args: Prisma.ConversationDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConversationPayload>
          }
          update: {
            args: Prisma.ConversationUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConversationPayload>
          }
          deleteMany: {
            args: Prisma.ConversationDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ConversationUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ConversationUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConversationPayload>
          }
          aggregate: {
            args: Prisma.ConversationAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateConversation>
          }
          groupBy: {
            args: Prisma.ConversationGroupByArgs<ExtArgs>
            result: $Utils.Optional<ConversationGroupByOutputType>[]
          }
          count: {
            args: Prisma.ConversationCountArgs<ExtArgs>
            result: $Utils.Optional<ConversationCountAggregateOutputType> | number
          }
        }
      }
      Message: {
        payload: Prisma.$MessagePayload<ExtArgs>
        fields: Prisma.MessageFieldRefs
        operations: {
          findUnique: {
            args: Prisma.MessageFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MessagePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.MessageFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MessagePayload>
          }
          findFirst: {
            args: Prisma.MessageFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MessagePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.MessageFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MessagePayload>
          }
          findMany: {
            args: Prisma.MessageFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MessagePayload>[]
          }
          create: {
            args: Prisma.MessageCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MessagePayload>
          }
          createMany: {
            args: Prisma.MessageCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.MessageCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MessagePayload>[]
          }
          delete: {
            args: Prisma.MessageDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MessagePayload>
          }
          update: {
            args: Prisma.MessageUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MessagePayload>
          }
          deleteMany: {
            args: Prisma.MessageDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.MessageUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.MessageUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MessagePayload>
          }
          aggregate: {
            args: Prisma.MessageAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateMessage>
          }
          groupBy: {
            args: Prisma.MessageGroupByArgs<ExtArgs>
            result: $Utils.Optional<MessageGroupByOutputType>[]
          }
          count: {
            args: Prisma.MessageCountArgs<ExtArgs>
            result: $Utils.Optional<MessageCountAggregateOutputType> | number
          }
        }
      }
      FlowDefinition: {
        payload: Prisma.$FlowDefinitionPayload<ExtArgs>
        fields: Prisma.FlowDefinitionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.FlowDefinitionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FlowDefinitionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.FlowDefinitionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FlowDefinitionPayload>
          }
          findFirst: {
            args: Prisma.FlowDefinitionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FlowDefinitionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.FlowDefinitionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FlowDefinitionPayload>
          }
          findMany: {
            args: Prisma.FlowDefinitionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FlowDefinitionPayload>[]
          }
          create: {
            args: Prisma.FlowDefinitionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FlowDefinitionPayload>
          }
          createMany: {
            args: Prisma.FlowDefinitionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.FlowDefinitionCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FlowDefinitionPayload>[]
          }
          delete: {
            args: Prisma.FlowDefinitionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FlowDefinitionPayload>
          }
          update: {
            args: Prisma.FlowDefinitionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FlowDefinitionPayload>
          }
          deleteMany: {
            args: Prisma.FlowDefinitionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.FlowDefinitionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.FlowDefinitionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FlowDefinitionPayload>
          }
          aggregate: {
            args: Prisma.FlowDefinitionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateFlowDefinition>
          }
          groupBy: {
            args: Prisma.FlowDefinitionGroupByArgs<ExtArgs>
            result: $Utils.Optional<FlowDefinitionGroupByOutputType>[]
          }
          count: {
            args: Prisma.FlowDefinitionCountArgs<ExtArgs>
            result: $Utils.Optional<FlowDefinitionCountAggregateOutputType> | number
          }
        }
      }
      ZApiConfig: {
        payload: Prisma.$ZApiConfigPayload<ExtArgs>
        fields: Prisma.ZApiConfigFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ZApiConfigFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ZApiConfigPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ZApiConfigFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ZApiConfigPayload>
          }
          findFirst: {
            args: Prisma.ZApiConfigFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ZApiConfigPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ZApiConfigFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ZApiConfigPayload>
          }
          findMany: {
            args: Prisma.ZApiConfigFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ZApiConfigPayload>[]
          }
          create: {
            args: Prisma.ZApiConfigCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ZApiConfigPayload>
          }
          createMany: {
            args: Prisma.ZApiConfigCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ZApiConfigCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ZApiConfigPayload>[]
          }
          delete: {
            args: Prisma.ZApiConfigDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ZApiConfigPayload>
          }
          update: {
            args: Prisma.ZApiConfigUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ZApiConfigPayload>
          }
          deleteMany: {
            args: Prisma.ZApiConfigDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ZApiConfigUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ZApiConfigUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ZApiConfigPayload>
          }
          aggregate: {
            args: Prisma.ZApiConfigAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateZApiConfig>
          }
          groupBy: {
            args: Prisma.ZApiConfigGroupByArgs<ExtArgs>
            result: $Utils.Optional<ZApiConfigGroupByOutputType>[]
          }
          count: {
            args: Prisma.ZApiConfigCountArgs<ExtArgs>
            result: $Utils.Optional<ZApiConfigCountAggregateOutputType> | number
          }
        }
      }
      Shortcut: {
        payload: Prisma.$ShortcutPayload<ExtArgs>
        fields: Prisma.ShortcutFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ShortcutFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ShortcutPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ShortcutFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ShortcutPayload>
          }
          findFirst: {
            args: Prisma.ShortcutFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ShortcutPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ShortcutFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ShortcutPayload>
          }
          findMany: {
            args: Prisma.ShortcutFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ShortcutPayload>[]
          }
          create: {
            args: Prisma.ShortcutCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ShortcutPayload>
          }
          createMany: {
            args: Prisma.ShortcutCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ShortcutCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ShortcutPayload>[]
          }
          delete: {
            args: Prisma.ShortcutDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ShortcutPayload>
          }
          update: {
            args: Prisma.ShortcutUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ShortcutPayload>
          }
          deleteMany: {
            args: Prisma.ShortcutDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ShortcutUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ShortcutUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ShortcutPayload>
          }
          aggregate: {
            args: Prisma.ShortcutAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateShortcut>
          }
          groupBy: {
            args: Prisma.ShortcutGroupByArgs<ExtArgs>
            result: $Utils.Optional<ShortcutGroupByOutputType>[]
          }
          count: {
            args: Prisma.ShortcutCountArgs<ExtArgs>
            result: $Utils.Optional<ShortcutCountAggregateOutputType> | number
          }
        }
      }
      ShortcutAudit: {
        payload: Prisma.$ShortcutAuditPayload<ExtArgs>
        fields: Prisma.ShortcutAuditFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ShortcutAuditFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ShortcutAuditPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ShortcutAuditFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ShortcutAuditPayload>
          }
          findFirst: {
            args: Prisma.ShortcutAuditFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ShortcutAuditPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ShortcutAuditFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ShortcutAuditPayload>
          }
          findMany: {
            args: Prisma.ShortcutAuditFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ShortcutAuditPayload>[]
          }
          create: {
            args: Prisma.ShortcutAuditCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ShortcutAuditPayload>
          }
          createMany: {
            args: Prisma.ShortcutAuditCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ShortcutAuditCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ShortcutAuditPayload>[]
          }
          delete: {
            args: Prisma.ShortcutAuditDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ShortcutAuditPayload>
          }
          update: {
            args: Prisma.ShortcutAuditUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ShortcutAuditPayload>
          }
          deleteMany: {
            args: Prisma.ShortcutAuditDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ShortcutAuditUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ShortcutAuditUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ShortcutAuditPayload>
          }
          aggregate: {
            args: Prisma.ShortcutAuditAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateShortcutAudit>
          }
          groupBy: {
            args: Prisma.ShortcutAuditGroupByArgs<ExtArgs>
            result: $Utils.Optional<ShortcutAuditGroupByOutputType>[]
          }
          count: {
            args: Prisma.ShortcutAuditCountArgs<ExtArgs>
            result: $Utils.Optional<ShortcutAuditCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
  }


  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type DepartmentCountOutputType
   */

  export type DepartmentCountOutputType = {
    procedures: number
    agents: number
    conversations: number
    shortcuts: number
  }

  export type DepartmentCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    procedures?: boolean | DepartmentCountOutputTypeCountProceduresArgs
    agents?: boolean | DepartmentCountOutputTypeCountAgentsArgs
    conversations?: boolean | DepartmentCountOutputTypeCountConversationsArgs
    shortcuts?: boolean | DepartmentCountOutputTypeCountShortcutsArgs
  }

  // Custom InputTypes
  /**
   * DepartmentCountOutputType without action
   */
  export type DepartmentCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DepartmentCountOutputType
     */
    select?: DepartmentCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * DepartmentCountOutputType without action
   */
  export type DepartmentCountOutputTypeCountProceduresArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ProcedureWhereInput
  }

  /**
   * DepartmentCountOutputType without action
   */
  export type DepartmentCountOutputTypeCountAgentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AgentWhereInput
  }

  /**
   * DepartmentCountOutputType without action
   */
  export type DepartmentCountOutputTypeCountConversationsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ConversationWhereInput
  }

  /**
   * DepartmentCountOutputType without action
   */
  export type DepartmentCountOutputTypeCountShortcutsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ShortcutWhereInput
  }


  /**
   * Count Type AgentCountOutputType
   */

  export type AgentCountOutputType = {
    conversations: number
    messages: number
    ownedShortcuts: number
    createdShortcuts: number
    updatedShortcuts: number
    shortcutAudits: number
  }

  export type AgentCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    conversations?: boolean | AgentCountOutputTypeCountConversationsArgs
    messages?: boolean | AgentCountOutputTypeCountMessagesArgs
    ownedShortcuts?: boolean | AgentCountOutputTypeCountOwnedShortcutsArgs
    createdShortcuts?: boolean | AgentCountOutputTypeCountCreatedShortcutsArgs
    updatedShortcuts?: boolean | AgentCountOutputTypeCountUpdatedShortcutsArgs
    shortcutAudits?: boolean | AgentCountOutputTypeCountShortcutAuditsArgs
  }

  // Custom InputTypes
  /**
   * AgentCountOutputType without action
   */
  export type AgentCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgentCountOutputType
     */
    select?: AgentCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * AgentCountOutputType without action
   */
  export type AgentCountOutputTypeCountConversationsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ConversationWhereInput
  }

  /**
   * AgentCountOutputType without action
   */
  export type AgentCountOutputTypeCountMessagesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MessageWhereInput
  }

  /**
   * AgentCountOutputType without action
   */
  export type AgentCountOutputTypeCountOwnedShortcutsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ShortcutWhereInput
  }

  /**
   * AgentCountOutputType without action
   */
  export type AgentCountOutputTypeCountCreatedShortcutsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ShortcutWhereInput
  }

  /**
   * AgentCountOutputType without action
   */
  export type AgentCountOutputTypeCountUpdatedShortcutsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ShortcutWhereInput
  }

  /**
   * AgentCountOutputType without action
   */
  export type AgentCountOutputTypeCountShortcutAuditsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ShortcutAuditWhereInput
  }


  /**
   * Count Type ContactCountOutputType
   */

  export type ContactCountOutputType = {
    conversations: number
  }

  export type ContactCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    conversations?: boolean | ContactCountOutputTypeCountConversationsArgs
  }

  // Custom InputTypes
  /**
   * ContactCountOutputType without action
   */
  export type ContactCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ContactCountOutputType
     */
    select?: ContactCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * ContactCountOutputType without action
   */
  export type ContactCountOutputTypeCountConversationsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ConversationWhereInput
  }


  /**
   * Count Type ConversationCountOutputType
   */

  export type ConversationCountOutputType = {
    messages: number
  }

  export type ConversationCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    messages?: boolean | ConversationCountOutputTypeCountMessagesArgs
  }

  // Custom InputTypes
  /**
   * ConversationCountOutputType without action
   */
  export type ConversationCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConversationCountOutputType
     */
    select?: ConversationCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * ConversationCountOutputType without action
   */
  export type ConversationCountOutputTypeCountMessagesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MessageWhereInput
  }


  /**
   * Count Type ShortcutCountOutputType
   */

  export type ShortcutCountOutputType = {
    audits: number
  }

  export type ShortcutCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    audits?: boolean | ShortcutCountOutputTypeCountAuditsArgs
  }

  // Custom InputTypes
  /**
   * ShortcutCountOutputType without action
   */
  export type ShortcutCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ShortcutCountOutputType
     */
    select?: ShortcutCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * ShortcutCountOutputType without action
   */
  export type ShortcutCountOutputTypeCountAuditsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ShortcutAuditWhereInput
  }


  /**
   * Models
   */

  /**
   * Model Department
   */

  export type AggregateDepartment = {
    _count: DepartmentCountAggregateOutputType | null
    _min: DepartmentMinAggregateOutputType | null
    _max: DepartmentMaxAggregateOutputType | null
  }

  export type DepartmentMinAggregateOutputType = {
    id: string | null
    name: string | null
    description: string | null
    createdAt: Date | null
  }

  export type DepartmentMaxAggregateOutputType = {
    id: string | null
    name: string | null
    description: string | null
    createdAt: Date | null
  }

  export type DepartmentCountAggregateOutputType = {
    id: number
    name: number
    description: number
    createdAt: number
    _all: number
  }


  export type DepartmentMinAggregateInputType = {
    id?: true
    name?: true
    description?: true
    createdAt?: true
  }

  export type DepartmentMaxAggregateInputType = {
    id?: true
    name?: true
    description?: true
    createdAt?: true
  }

  export type DepartmentCountAggregateInputType = {
    id?: true
    name?: true
    description?: true
    createdAt?: true
    _all?: true
  }

  export type DepartmentAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Department to aggregate.
     */
    where?: DepartmentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Departments to fetch.
     */
    orderBy?: DepartmentOrderByWithRelationInput | DepartmentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: DepartmentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Departments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Departments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Departments
    **/
    _count?: true | DepartmentCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: DepartmentMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: DepartmentMaxAggregateInputType
  }

  export type GetDepartmentAggregateType<T extends DepartmentAggregateArgs> = {
        [P in keyof T & keyof AggregateDepartment]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateDepartment[P]>
      : GetScalarType<T[P], AggregateDepartment[P]>
  }




  export type DepartmentGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DepartmentWhereInput
    orderBy?: DepartmentOrderByWithAggregationInput | DepartmentOrderByWithAggregationInput[]
    by: DepartmentScalarFieldEnum[] | DepartmentScalarFieldEnum
    having?: DepartmentScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: DepartmentCountAggregateInputType | true
    _min?: DepartmentMinAggregateInputType
    _max?: DepartmentMaxAggregateInputType
  }

  export type DepartmentGroupByOutputType = {
    id: string
    name: string
    description: string | null
    createdAt: Date
    _count: DepartmentCountAggregateOutputType | null
    _min: DepartmentMinAggregateOutputType | null
    _max: DepartmentMaxAggregateOutputType | null
  }

  type GetDepartmentGroupByPayload<T extends DepartmentGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<DepartmentGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof DepartmentGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], DepartmentGroupByOutputType[P]>
            : GetScalarType<T[P], DepartmentGroupByOutputType[P]>
        }
      >
    >


  export type DepartmentSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    description?: boolean
    createdAt?: boolean
    procedures?: boolean | Department$proceduresArgs<ExtArgs>
    agents?: boolean | Department$agentsArgs<ExtArgs>
    conversations?: boolean | Department$conversationsArgs<ExtArgs>
    shortcuts?: boolean | Department$shortcutsArgs<ExtArgs>
    _count?: boolean | DepartmentCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["department"]>

  export type DepartmentSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    description?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["department"]>

  export type DepartmentSelectScalar = {
    id?: boolean
    name?: boolean
    description?: boolean
    createdAt?: boolean
  }

  export type DepartmentInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    procedures?: boolean | Department$proceduresArgs<ExtArgs>
    agents?: boolean | Department$agentsArgs<ExtArgs>
    conversations?: boolean | Department$conversationsArgs<ExtArgs>
    shortcuts?: boolean | Department$shortcutsArgs<ExtArgs>
    _count?: boolean | DepartmentCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type DepartmentIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $DepartmentPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Department"
    objects: {
      procedures: Prisma.$ProcedurePayload<ExtArgs>[]
      agents: Prisma.$AgentPayload<ExtArgs>[]
      conversations: Prisma.$ConversationPayload<ExtArgs>[]
      shortcuts: Prisma.$ShortcutPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      description: string | null
      createdAt: Date
    }, ExtArgs["result"]["department"]>
    composites: {}
  }

  type DepartmentGetPayload<S extends boolean | null | undefined | DepartmentDefaultArgs> = $Result.GetResult<Prisma.$DepartmentPayload, S>

  type DepartmentCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<DepartmentFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: DepartmentCountAggregateInputType | true
    }

  export interface DepartmentDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Department'], meta: { name: 'Department' } }
    /**
     * Find zero or one Department that matches the filter.
     * @param {DepartmentFindUniqueArgs} args - Arguments to find a Department
     * @example
     * // Get one Department
     * const department = await prisma.department.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends DepartmentFindUniqueArgs>(args: SelectSubset<T, DepartmentFindUniqueArgs<ExtArgs>>): Prisma__DepartmentClient<$Result.GetResult<Prisma.$DepartmentPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Department that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {DepartmentFindUniqueOrThrowArgs} args - Arguments to find a Department
     * @example
     * // Get one Department
     * const department = await prisma.department.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends DepartmentFindUniqueOrThrowArgs>(args: SelectSubset<T, DepartmentFindUniqueOrThrowArgs<ExtArgs>>): Prisma__DepartmentClient<$Result.GetResult<Prisma.$DepartmentPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Department that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DepartmentFindFirstArgs} args - Arguments to find a Department
     * @example
     * // Get one Department
     * const department = await prisma.department.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends DepartmentFindFirstArgs>(args?: SelectSubset<T, DepartmentFindFirstArgs<ExtArgs>>): Prisma__DepartmentClient<$Result.GetResult<Prisma.$DepartmentPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Department that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DepartmentFindFirstOrThrowArgs} args - Arguments to find a Department
     * @example
     * // Get one Department
     * const department = await prisma.department.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends DepartmentFindFirstOrThrowArgs>(args?: SelectSubset<T, DepartmentFindFirstOrThrowArgs<ExtArgs>>): Prisma__DepartmentClient<$Result.GetResult<Prisma.$DepartmentPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Departments that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DepartmentFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Departments
     * const departments = await prisma.department.findMany()
     * 
     * // Get first 10 Departments
     * const departments = await prisma.department.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const departmentWithIdOnly = await prisma.department.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends DepartmentFindManyArgs>(args?: SelectSubset<T, DepartmentFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DepartmentPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Department.
     * @param {DepartmentCreateArgs} args - Arguments to create a Department.
     * @example
     * // Create one Department
     * const Department = await prisma.department.create({
     *   data: {
     *     // ... data to create a Department
     *   }
     * })
     * 
     */
    create<T extends DepartmentCreateArgs>(args: SelectSubset<T, DepartmentCreateArgs<ExtArgs>>): Prisma__DepartmentClient<$Result.GetResult<Prisma.$DepartmentPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Departments.
     * @param {DepartmentCreateManyArgs} args - Arguments to create many Departments.
     * @example
     * // Create many Departments
     * const department = await prisma.department.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends DepartmentCreateManyArgs>(args?: SelectSubset<T, DepartmentCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Departments and returns the data saved in the database.
     * @param {DepartmentCreateManyAndReturnArgs} args - Arguments to create many Departments.
     * @example
     * // Create many Departments
     * const department = await prisma.department.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Departments and only return the `id`
     * const departmentWithIdOnly = await prisma.department.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends DepartmentCreateManyAndReturnArgs>(args?: SelectSubset<T, DepartmentCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DepartmentPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Department.
     * @param {DepartmentDeleteArgs} args - Arguments to delete one Department.
     * @example
     * // Delete one Department
     * const Department = await prisma.department.delete({
     *   where: {
     *     // ... filter to delete one Department
     *   }
     * })
     * 
     */
    delete<T extends DepartmentDeleteArgs>(args: SelectSubset<T, DepartmentDeleteArgs<ExtArgs>>): Prisma__DepartmentClient<$Result.GetResult<Prisma.$DepartmentPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Department.
     * @param {DepartmentUpdateArgs} args - Arguments to update one Department.
     * @example
     * // Update one Department
     * const department = await prisma.department.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends DepartmentUpdateArgs>(args: SelectSubset<T, DepartmentUpdateArgs<ExtArgs>>): Prisma__DepartmentClient<$Result.GetResult<Prisma.$DepartmentPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Departments.
     * @param {DepartmentDeleteManyArgs} args - Arguments to filter Departments to delete.
     * @example
     * // Delete a few Departments
     * const { count } = await prisma.department.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends DepartmentDeleteManyArgs>(args?: SelectSubset<T, DepartmentDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Departments.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DepartmentUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Departments
     * const department = await prisma.department.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends DepartmentUpdateManyArgs>(args: SelectSubset<T, DepartmentUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Department.
     * @param {DepartmentUpsertArgs} args - Arguments to update or create a Department.
     * @example
     * // Update or create a Department
     * const department = await prisma.department.upsert({
     *   create: {
     *     // ... data to create a Department
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Department we want to update
     *   }
     * })
     */
    upsert<T extends DepartmentUpsertArgs>(args: SelectSubset<T, DepartmentUpsertArgs<ExtArgs>>): Prisma__DepartmentClient<$Result.GetResult<Prisma.$DepartmentPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Departments.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DepartmentCountArgs} args - Arguments to filter Departments to count.
     * @example
     * // Count the number of Departments
     * const count = await prisma.department.count({
     *   where: {
     *     // ... the filter for the Departments we want to count
     *   }
     * })
    **/
    count<T extends DepartmentCountArgs>(
      args?: Subset<T, DepartmentCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], DepartmentCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Department.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DepartmentAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends DepartmentAggregateArgs>(args: Subset<T, DepartmentAggregateArgs>): Prisma.PrismaPromise<GetDepartmentAggregateType<T>>

    /**
     * Group by Department.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DepartmentGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends DepartmentGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: DepartmentGroupByArgs['orderBy'] }
        : { orderBy?: DepartmentGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, DepartmentGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetDepartmentGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Department model
   */
  readonly fields: DepartmentFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Department.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__DepartmentClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    procedures<T extends Department$proceduresArgs<ExtArgs> = {}>(args?: Subset<T, Department$proceduresArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProcedurePayload<ExtArgs>, T, "findMany"> | Null>
    agents<T extends Department$agentsArgs<ExtArgs> = {}>(args?: Subset<T, Department$agentsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AgentPayload<ExtArgs>, T, "findMany"> | Null>
    conversations<T extends Department$conversationsArgs<ExtArgs> = {}>(args?: Subset<T, Department$conversationsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ConversationPayload<ExtArgs>, T, "findMany"> | Null>
    shortcuts<T extends Department$shortcutsArgs<ExtArgs> = {}>(args?: Subset<T, Department$shortcutsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ShortcutPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Department model
   */ 
  interface DepartmentFieldRefs {
    readonly id: FieldRef<"Department", 'String'>
    readonly name: FieldRef<"Department", 'String'>
    readonly description: FieldRef<"Department", 'String'>
    readonly createdAt: FieldRef<"Department", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Department findUnique
   */
  export type DepartmentFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Department
     */
    select?: DepartmentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DepartmentInclude<ExtArgs> | null
    /**
     * Filter, which Department to fetch.
     */
    where: DepartmentWhereUniqueInput
  }

  /**
   * Department findUniqueOrThrow
   */
  export type DepartmentFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Department
     */
    select?: DepartmentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DepartmentInclude<ExtArgs> | null
    /**
     * Filter, which Department to fetch.
     */
    where: DepartmentWhereUniqueInput
  }

  /**
   * Department findFirst
   */
  export type DepartmentFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Department
     */
    select?: DepartmentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DepartmentInclude<ExtArgs> | null
    /**
     * Filter, which Department to fetch.
     */
    where?: DepartmentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Departments to fetch.
     */
    orderBy?: DepartmentOrderByWithRelationInput | DepartmentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Departments.
     */
    cursor?: DepartmentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Departments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Departments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Departments.
     */
    distinct?: DepartmentScalarFieldEnum | DepartmentScalarFieldEnum[]
  }

  /**
   * Department findFirstOrThrow
   */
  export type DepartmentFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Department
     */
    select?: DepartmentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DepartmentInclude<ExtArgs> | null
    /**
     * Filter, which Department to fetch.
     */
    where?: DepartmentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Departments to fetch.
     */
    orderBy?: DepartmentOrderByWithRelationInput | DepartmentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Departments.
     */
    cursor?: DepartmentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Departments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Departments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Departments.
     */
    distinct?: DepartmentScalarFieldEnum | DepartmentScalarFieldEnum[]
  }

  /**
   * Department findMany
   */
  export type DepartmentFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Department
     */
    select?: DepartmentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DepartmentInclude<ExtArgs> | null
    /**
     * Filter, which Departments to fetch.
     */
    where?: DepartmentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Departments to fetch.
     */
    orderBy?: DepartmentOrderByWithRelationInput | DepartmentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Departments.
     */
    cursor?: DepartmentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Departments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Departments.
     */
    skip?: number
    distinct?: DepartmentScalarFieldEnum | DepartmentScalarFieldEnum[]
  }

  /**
   * Department create
   */
  export type DepartmentCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Department
     */
    select?: DepartmentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DepartmentInclude<ExtArgs> | null
    /**
     * The data needed to create a Department.
     */
    data: XOR<DepartmentCreateInput, DepartmentUncheckedCreateInput>
  }

  /**
   * Department createMany
   */
  export type DepartmentCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Departments.
     */
    data: DepartmentCreateManyInput | DepartmentCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Department createManyAndReturn
   */
  export type DepartmentCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Department
     */
    select?: DepartmentSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Departments.
     */
    data: DepartmentCreateManyInput | DepartmentCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Department update
   */
  export type DepartmentUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Department
     */
    select?: DepartmentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DepartmentInclude<ExtArgs> | null
    /**
     * The data needed to update a Department.
     */
    data: XOR<DepartmentUpdateInput, DepartmentUncheckedUpdateInput>
    /**
     * Choose, which Department to update.
     */
    where: DepartmentWhereUniqueInput
  }

  /**
   * Department updateMany
   */
  export type DepartmentUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Departments.
     */
    data: XOR<DepartmentUpdateManyMutationInput, DepartmentUncheckedUpdateManyInput>
    /**
     * Filter which Departments to update
     */
    where?: DepartmentWhereInput
  }

  /**
   * Department upsert
   */
  export type DepartmentUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Department
     */
    select?: DepartmentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DepartmentInclude<ExtArgs> | null
    /**
     * The filter to search for the Department to update in case it exists.
     */
    where: DepartmentWhereUniqueInput
    /**
     * In case the Department found by the `where` argument doesn't exist, create a new Department with this data.
     */
    create: XOR<DepartmentCreateInput, DepartmentUncheckedCreateInput>
    /**
     * In case the Department was found with the provided `where` argument, update it with this data.
     */
    update: XOR<DepartmentUpdateInput, DepartmentUncheckedUpdateInput>
  }

  /**
   * Department delete
   */
  export type DepartmentDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Department
     */
    select?: DepartmentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DepartmentInclude<ExtArgs> | null
    /**
     * Filter which Department to delete.
     */
    where: DepartmentWhereUniqueInput
  }

  /**
   * Department deleteMany
   */
  export type DepartmentDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Departments to delete
     */
    where?: DepartmentWhereInput
  }

  /**
   * Department.procedures
   */
  export type Department$proceduresArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Procedure
     */
    select?: ProcedureSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcedureInclude<ExtArgs> | null
    where?: ProcedureWhereInput
    orderBy?: ProcedureOrderByWithRelationInput | ProcedureOrderByWithRelationInput[]
    cursor?: ProcedureWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ProcedureScalarFieldEnum | ProcedureScalarFieldEnum[]
  }

  /**
   * Department.agents
   */
  export type Department$agentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Agent
     */
    select?: AgentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgentInclude<ExtArgs> | null
    where?: AgentWhereInput
    orderBy?: AgentOrderByWithRelationInput | AgentOrderByWithRelationInput[]
    cursor?: AgentWhereUniqueInput
    take?: number
    skip?: number
    distinct?: AgentScalarFieldEnum | AgentScalarFieldEnum[]
  }

  /**
   * Department.conversations
   */
  export type Department$conversationsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Conversation
     */
    select?: ConversationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConversationInclude<ExtArgs> | null
    where?: ConversationWhereInput
    orderBy?: ConversationOrderByWithRelationInput | ConversationOrderByWithRelationInput[]
    cursor?: ConversationWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ConversationScalarFieldEnum | ConversationScalarFieldEnum[]
  }

  /**
   * Department.shortcuts
   */
  export type Department$shortcutsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Shortcut
     */
    select?: ShortcutSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShortcutInclude<ExtArgs> | null
    where?: ShortcutWhereInput
    orderBy?: ShortcutOrderByWithRelationInput | ShortcutOrderByWithRelationInput[]
    cursor?: ShortcutWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ShortcutScalarFieldEnum | ShortcutScalarFieldEnum[]
  }

  /**
   * Department without action
   */
  export type DepartmentDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Department
     */
    select?: DepartmentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DepartmentInclude<ExtArgs> | null
  }


  /**
   * Model Procedure
   */

  export type AggregateProcedure = {
    _count: ProcedureCountAggregateOutputType | null
    _avg: ProcedureAvgAggregateOutputType | null
    _sum: ProcedureSumAggregateOutputType | null
    _min: ProcedureMinAggregateOutputType | null
    _max: ProcedureMaxAggregateOutputType | null
  }

  export type ProcedureAvgAggregateOutputType = {
    order: number | null
  }

  export type ProcedureSumAggregateOutputType = {
    order: number | null
  }

  export type ProcedureMinAggregateOutputType = {
    id: string | null
    departmentId: string | null
    title: string | null
    content: string | null
    order: number | null
  }

  export type ProcedureMaxAggregateOutputType = {
    id: string | null
    departmentId: string | null
    title: string | null
    content: string | null
    order: number | null
  }

  export type ProcedureCountAggregateOutputType = {
    id: number
    departmentId: number
    title: number
    content: number
    order: number
    _all: number
  }


  export type ProcedureAvgAggregateInputType = {
    order?: true
  }

  export type ProcedureSumAggregateInputType = {
    order?: true
  }

  export type ProcedureMinAggregateInputType = {
    id?: true
    departmentId?: true
    title?: true
    content?: true
    order?: true
  }

  export type ProcedureMaxAggregateInputType = {
    id?: true
    departmentId?: true
    title?: true
    content?: true
    order?: true
  }

  export type ProcedureCountAggregateInputType = {
    id?: true
    departmentId?: true
    title?: true
    content?: true
    order?: true
    _all?: true
  }

  export type ProcedureAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Procedure to aggregate.
     */
    where?: ProcedureWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Procedures to fetch.
     */
    orderBy?: ProcedureOrderByWithRelationInput | ProcedureOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ProcedureWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Procedures from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Procedures.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Procedures
    **/
    _count?: true | ProcedureCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ProcedureAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ProcedureSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ProcedureMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ProcedureMaxAggregateInputType
  }

  export type GetProcedureAggregateType<T extends ProcedureAggregateArgs> = {
        [P in keyof T & keyof AggregateProcedure]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateProcedure[P]>
      : GetScalarType<T[P], AggregateProcedure[P]>
  }




  export type ProcedureGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ProcedureWhereInput
    orderBy?: ProcedureOrderByWithAggregationInput | ProcedureOrderByWithAggregationInput[]
    by: ProcedureScalarFieldEnum[] | ProcedureScalarFieldEnum
    having?: ProcedureScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ProcedureCountAggregateInputType | true
    _avg?: ProcedureAvgAggregateInputType
    _sum?: ProcedureSumAggregateInputType
    _min?: ProcedureMinAggregateInputType
    _max?: ProcedureMaxAggregateInputType
  }

  export type ProcedureGroupByOutputType = {
    id: string
    departmentId: string
    title: string
    content: string
    order: number
    _count: ProcedureCountAggregateOutputType | null
    _avg: ProcedureAvgAggregateOutputType | null
    _sum: ProcedureSumAggregateOutputType | null
    _min: ProcedureMinAggregateOutputType | null
    _max: ProcedureMaxAggregateOutputType | null
  }

  type GetProcedureGroupByPayload<T extends ProcedureGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ProcedureGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ProcedureGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ProcedureGroupByOutputType[P]>
            : GetScalarType<T[P], ProcedureGroupByOutputType[P]>
        }
      >
    >


  export type ProcedureSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    departmentId?: boolean
    title?: boolean
    content?: boolean
    order?: boolean
    department?: boolean | DepartmentDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["procedure"]>

  export type ProcedureSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    departmentId?: boolean
    title?: boolean
    content?: boolean
    order?: boolean
    department?: boolean | DepartmentDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["procedure"]>

  export type ProcedureSelectScalar = {
    id?: boolean
    departmentId?: boolean
    title?: boolean
    content?: boolean
    order?: boolean
  }

  export type ProcedureInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    department?: boolean | DepartmentDefaultArgs<ExtArgs>
  }
  export type ProcedureIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    department?: boolean | DepartmentDefaultArgs<ExtArgs>
  }

  export type $ProcedurePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Procedure"
    objects: {
      department: Prisma.$DepartmentPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      departmentId: string
      title: string
      content: string
      order: number
    }, ExtArgs["result"]["procedure"]>
    composites: {}
  }

  type ProcedureGetPayload<S extends boolean | null | undefined | ProcedureDefaultArgs> = $Result.GetResult<Prisma.$ProcedurePayload, S>

  type ProcedureCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<ProcedureFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: ProcedureCountAggregateInputType | true
    }

  export interface ProcedureDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Procedure'], meta: { name: 'Procedure' } }
    /**
     * Find zero or one Procedure that matches the filter.
     * @param {ProcedureFindUniqueArgs} args - Arguments to find a Procedure
     * @example
     * // Get one Procedure
     * const procedure = await prisma.procedure.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ProcedureFindUniqueArgs>(args: SelectSubset<T, ProcedureFindUniqueArgs<ExtArgs>>): Prisma__ProcedureClient<$Result.GetResult<Prisma.$ProcedurePayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Procedure that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {ProcedureFindUniqueOrThrowArgs} args - Arguments to find a Procedure
     * @example
     * // Get one Procedure
     * const procedure = await prisma.procedure.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ProcedureFindUniqueOrThrowArgs>(args: SelectSubset<T, ProcedureFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ProcedureClient<$Result.GetResult<Prisma.$ProcedurePayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Procedure that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcedureFindFirstArgs} args - Arguments to find a Procedure
     * @example
     * // Get one Procedure
     * const procedure = await prisma.procedure.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ProcedureFindFirstArgs>(args?: SelectSubset<T, ProcedureFindFirstArgs<ExtArgs>>): Prisma__ProcedureClient<$Result.GetResult<Prisma.$ProcedurePayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Procedure that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcedureFindFirstOrThrowArgs} args - Arguments to find a Procedure
     * @example
     * // Get one Procedure
     * const procedure = await prisma.procedure.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ProcedureFindFirstOrThrowArgs>(args?: SelectSubset<T, ProcedureFindFirstOrThrowArgs<ExtArgs>>): Prisma__ProcedureClient<$Result.GetResult<Prisma.$ProcedurePayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Procedures that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcedureFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Procedures
     * const procedures = await prisma.procedure.findMany()
     * 
     * // Get first 10 Procedures
     * const procedures = await prisma.procedure.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const procedureWithIdOnly = await prisma.procedure.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ProcedureFindManyArgs>(args?: SelectSubset<T, ProcedureFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProcedurePayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Procedure.
     * @param {ProcedureCreateArgs} args - Arguments to create a Procedure.
     * @example
     * // Create one Procedure
     * const Procedure = await prisma.procedure.create({
     *   data: {
     *     // ... data to create a Procedure
     *   }
     * })
     * 
     */
    create<T extends ProcedureCreateArgs>(args: SelectSubset<T, ProcedureCreateArgs<ExtArgs>>): Prisma__ProcedureClient<$Result.GetResult<Prisma.$ProcedurePayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Procedures.
     * @param {ProcedureCreateManyArgs} args - Arguments to create many Procedures.
     * @example
     * // Create many Procedures
     * const procedure = await prisma.procedure.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ProcedureCreateManyArgs>(args?: SelectSubset<T, ProcedureCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Procedures and returns the data saved in the database.
     * @param {ProcedureCreateManyAndReturnArgs} args - Arguments to create many Procedures.
     * @example
     * // Create many Procedures
     * const procedure = await prisma.procedure.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Procedures and only return the `id`
     * const procedureWithIdOnly = await prisma.procedure.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ProcedureCreateManyAndReturnArgs>(args?: SelectSubset<T, ProcedureCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProcedurePayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Procedure.
     * @param {ProcedureDeleteArgs} args - Arguments to delete one Procedure.
     * @example
     * // Delete one Procedure
     * const Procedure = await prisma.procedure.delete({
     *   where: {
     *     // ... filter to delete one Procedure
     *   }
     * })
     * 
     */
    delete<T extends ProcedureDeleteArgs>(args: SelectSubset<T, ProcedureDeleteArgs<ExtArgs>>): Prisma__ProcedureClient<$Result.GetResult<Prisma.$ProcedurePayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Procedure.
     * @param {ProcedureUpdateArgs} args - Arguments to update one Procedure.
     * @example
     * // Update one Procedure
     * const procedure = await prisma.procedure.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ProcedureUpdateArgs>(args: SelectSubset<T, ProcedureUpdateArgs<ExtArgs>>): Prisma__ProcedureClient<$Result.GetResult<Prisma.$ProcedurePayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Procedures.
     * @param {ProcedureDeleteManyArgs} args - Arguments to filter Procedures to delete.
     * @example
     * // Delete a few Procedures
     * const { count } = await prisma.procedure.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ProcedureDeleteManyArgs>(args?: SelectSubset<T, ProcedureDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Procedures.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcedureUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Procedures
     * const procedure = await prisma.procedure.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ProcedureUpdateManyArgs>(args: SelectSubset<T, ProcedureUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Procedure.
     * @param {ProcedureUpsertArgs} args - Arguments to update or create a Procedure.
     * @example
     * // Update or create a Procedure
     * const procedure = await prisma.procedure.upsert({
     *   create: {
     *     // ... data to create a Procedure
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Procedure we want to update
     *   }
     * })
     */
    upsert<T extends ProcedureUpsertArgs>(args: SelectSubset<T, ProcedureUpsertArgs<ExtArgs>>): Prisma__ProcedureClient<$Result.GetResult<Prisma.$ProcedurePayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Procedures.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcedureCountArgs} args - Arguments to filter Procedures to count.
     * @example
     * // Count the number of Procedures
     * const count = await prisma.procedure.count({
     *   where: {
     *     // ... the filter for the Procedures we want to count
     *   }
     * })
    **/
    count<T extends ProcedureCountArgs>(
      args?: Subset<T, ProcedureCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ProcedureCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Procedure.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcedureAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ProcedureAggregateArgs>(args: Subset<T, ProcedureAggregateArgs>): Prisma.PrismaPromise<GetProcedureAggregateType<T>>

    /**
     * Group by Procedure.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcedureGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ProcedureGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ProcedureGroupByArgs['orderBy'] }
        : { orderBy?: ProcedureGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ProcedureGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetProcedureGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Procedure model
   */
  readonly fields: ProcedureFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Procedure.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ProcedureClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    department<T extends DepartmentDefaultArgs<ExtArgs> = {}>(args?: Subset<T, DepartmentDefaultArgs<ExtArgs>>): Prisma__DepartmentClient<$Result.GetResult<Prisma.$DepartmentPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Procedure model
   */ 
  interface ProcedureFieldRefs {
    readonly id: FieldRef<"Procedure", 'String'>
    readonly departmentId: FieldRef<"Procedure", 'String'>
    readonly title: FieldRef<"Procedure", 'String'>
    readonly content: FieldRef<"Procedure", 'String'>
    readonly order: FieldRef<"Procedure", 'Int'>
  }
    

  // Custom InputTypes
  /**
   * Procedure findUnique
   */
  export type ProcedureFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Procedure
     */
    select?: ProcedureSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcedureInclude<ExtArgs> | null
    /**
     * Filter, which Procedure to fetch.
     */
    where: ProcedureWhereUniqueInput
  }

  /**
   * Procedure findUniqueOrThrow
   */
  export type ProcedureFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Procedure
     */
    select?: ProcedureSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcedureInclude<ExtArgs> | null
    /**
     * Filter, which Procedure to fetch.
     */
    where: ProcedureWhereUniqueInput
  }

  /**
   * Procedure findFirst
   */
  export type ProcedureFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Procedure
     */
    select?: ProcedureSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcedureInclude<ExtArgs> | null
    /**
     * Filter, which Procedure to fetch.
     */
    where?: ProcedureWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Procedures to fetch.
     */
    orderBy?: ProcedureOrderByWithRelationInput | ProcedureOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Procedures.
     */
    cursor?: ProcedureWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Procedures from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Procedures.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Procedures.
     */
    distinct?: ProcedureScalarFieldEnum | ProcedureScalarFieldEnum[]
  }

  /**
   * Procedure findFirstOrThrow
   */
  export type ProcedureFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Procedure
     */
    select?: ProcedureSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcedureInclude<ExtArgs> | null
    /**
     * Filter, which Procedure to fetch.
     */
    where?: ProcedureWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Procedures to fetch.
     */
    orderBy?: ProcedureOrderByWithRelationInput | ProcedureOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Procedures.
     */
    cursor?: ProcedureWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Procedures from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Procedures.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Procedures.
     */
    distinct?: ProcedureScalarFieldEnum | ProcedureScalarFieldEnum[]
  }

  /**
   * Procedure findMany
   */
  export type ProcedureFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Procedure
     */
    select?: ProcedureSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcedureInclude<ExtArgs> | null
    /**
     * Filter, which Procedures to fetch.
     */
    where?: ProcedureWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Procedures to fetch.
     */
    orderBy?: ProcedureOrderByWithRelationInput | ProcedureOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Procedures.
     */
    cursor?: ProcedureWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Procedures from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Procedures.
     */
    skip?: number
    distinct?: ProcedureScalarFieldEnum | ProcedureScalarFieldEnum[]
  }

  /**
   * Procedure create
   */
  export type ProcedureCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Procedure
     */
    select?: ProcedureSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcedureInclude<ExtArgs> | null
    /**
     * The data needed to create a Procedure.
     */
    data: XOR<ProcedureCreateInput, ProcedureUncheckedCreateInput>
  }

  /**
   * Procedure createMany
   */
  export type ProcedureCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Procedures.
     */
    data: ProcedureCreateManyInput | ProcedureCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Procedure createManyAndReturn
   */
  export type ProcedureCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Procedure
     */
    select?: ProcedureSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Procedures.
     */
    data: ProcedureCreateManyInput | ProcedureCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcedureIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Procedure update
   */
  export type ProcedureUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Procedure
     */
    select?: ProcedureSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcedureInclude<ExtArgs> | null
    /**
     * The data needed to update a Procedure.
     */
    data: XOR<ProcedureUpdateInput, ProcedureUncheckedUpdateInput>
    /**
     * Choose, which Procedure to update.
     */
    where: ProcedureWhereUniqueInput
  }

  /**
   * Procedure updateMany
   */
  export type ProcedureUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Procedures.
     */
    data: XOR<ProcedureUpdateManyMutationInput, ProcedureUncheckedUpdateManyInput>
    /**
     * Filter which Procedures to update
     */
    where?: ProcedureWhereInput
  }

  /**
   * Procedure upsert
   */
  export type ProcedureUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Procedure
     */
    select?: ProcedureSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcedureInclude<ExtArgs> | null
    /**
     * The filter to search for the Procedure to update in case it exists.
     */
    where: ProcedureWhereUniqueInput
    /**
     * In case the Procedure found by the `where` argument doesn't exist, create a new Procedure with this data.
     */
    create: XOR<ProcedureCreateInput, ProcedureUncheckedCreateInput>
    /**
     * In case the Procedure was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ProcedureUpdateInput, ProcedureUncheckedUpdateInput>
  }

  /**
   * Procedure delete
   */
  export type ProcedureDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Procedure
     */
    select?: ProcedureSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcedureInclude<ExtArgs> | null
    /**
     * Filter which Procedure to delete.
     */
    where: ProcedureWhereUniqueInput
  }

  /**
   * Procedure deleteMany
   */
  export type ProcedureDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Procedures to delete
     */
    where?: ProcedureWhereInput
  }

  /**
   * Procedure without action
   */
  export type ProcedureDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Procedure
     */
    select?: ProcedureSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcedureInclude<ExtArgs> | null
  }


  /**
   * Model Agent
   */

  export type AggregateAgent = {
    _count: AgentCountAggregateOutputType | null
    _min: AgentMinAggregateOutputType | null
    _max: AgentMaxAggregateOutputType | null
  }

  export type AgentMinAggregateOutputType = {
    id: string | null
    name: string | null
    email: string | null
    password: string | null
    role: string | null
    isActive: boolean | null
    departmentId: string | null
    isOnline: boolean | null
    createdAt: Date | null
  }

  export type AgentMaxAggregateOutputType = {
    id: string | null
    name: string | null
    email: string | null
    password: string | null
    role: string | null
    isActive: boolean | null
    departmentId: string | null
    isOnline: boolean | null
    createdAt: Date | null
  }

  export type AgentCountAggregateOutputType = {
    id: number
    name: number
    email: number
    password: number
    role: number
    isActive: number
    departmentId: number
    isOnline: number
    createdAt: number
    _all: number
  }


  export type AgentMinAggregateInputType = {
    id?: true
    name?: true
    email?: true
    password?: true
    role?: true
    isActive?: true
    departmentId?: true
    isOnline?: true
    createdAt?: true
  }

  export type AgentMaxAggregateInputType = {
    id?: true
    name?: true
    email?: true
    password?: true
    role?: true
    isActive?: true
    departmentId?: true
    isOnline?: true
    createdAt?: true
  }

  export type AgentCountAggregateInputType = {
    id?: true
    name?: true
    email?: true
    password?: true
    role?: true
    isActive?: true
    departmentId?: true
    isOnline?: true
    createdAt?: true
    _all?: true
  }

  export type AgentAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Agent to aggregate.
     */
    where?: AgentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Agents to fetch.
     */
    orderBy?: AgentOrderByWithRelationInput | AgentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AgentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Agents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Agents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Agents
    **/
    _count?: true | AgentCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AgentMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AgentMaxAggregateInputType
  }

  export type GetAgentAggregateType<T extends AgentAggregateArgs> = {
        [P in keyof T & keyof AggregateAgent]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAgent[P]>
      : GetScalarType<T[P], AggregateAgent[P]>
  }




  export type AgentGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AgentWhereInput
    orderBy?: AgentOrderByWithAggregationInput | AgentOrderByWithAggregationInput[]
    by: AgentScalarFieldEnum[] | AgentScalarFieldEnum
    having?: AgentScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AgentCountAggregateInputType | true
    _min?: AgentMinAggregateInputType
    _max?: AgentMaxAggregateInputType
  }

  export type AgentGroupByOutputType = {
    id: string
    name: string
    email: string
    password: string
    role: string
    isActive: boolean
    departmentId: string | null
    isOnline: boolean
    createdAt: Date
    _count: AgentCountAggregateOutputType | null
    _min: AgentMinAggregateOutputType | null
    _max: AgentMaxAggregateOutputType | null
  }

  type GetAgentGroupByPayload<T extends AgentGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AgentGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AgentGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AgentGroupByOutputType[P]>
            : GetScalarType<T[P], AgentGroupByOutputType[P]>
        }
      >
    >


  export type AgentSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    email?: boolean
    password?: boolean
    role?: boolean
    isActive?: boolean
    departmentId?: boolean
    isOnline?: boolean
    createdAt?: boolean
    department?: boolean | Agent$departmentArgs<ExtArgs>
    conversations?: boolean | Agent$conversationsArgs<ExtArgs>
    messages?: boolean | Agent$messagesArgs<ExtArgs>
    ownedShortcuts?: boolean | Agent$ownedShortcutsArgs<ExtArgs>
    createdShortcuts?: boolean | Agent$createdShortcutsArgs<ExtArgs>
    updatedShortcuts?: boolean | Agent$updatedShortcutsArgs<ExtArgs>
    shortcutAudits?: boolean | Agent$shortcutAuditsArgs<ExtArgs>
    _count?: boolean | AgentCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["agent"]>

  export type AgentSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    email?: boolean
    password?: boolean
    role?: boolean
    isActive?: boolean
    departmentId?: boolean
    isOnline?: boolean
    createdAt?: boolean
    department?: boolean | Agent$departmentArgs<ExtArgs>
  }, ExtArgs["result"]["agent"]>

  export type AgentSelectScalar = {
    id?: boolean
    name?: boolean
    email?: boolean
    password?: boolean
    role?: boolean
    isActive?: boolean
    departmentId?: boolean
    isOnline?: boolean
    createdAt?: boolean
  }

  export type AgentInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    department?: boolean | Agent$departmentArgs<ExtArgs>
    conversations?: boolean | Agent$conversationsArgs<ExtArgs>
    messages?: boolean | Agent$messagesArgs<ExtArgs>
    ownedShortcuts?: boolean | Agent$ownedShortcutsArgs<ExtArgs>
    createdShortcuts?: boolean | Agent$createdShortcutsArgs<ExtArgs>
    updatedShortcuts?: boolean | Agent$updatedShortcutsArgs<ExtArgs>
    shortcutAudits?: boolean | Agent$shortcutAuditsArgs<ExtArgs>
    _count?: boolean | AgentCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type AgentIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    department?: boolean | Agent$departmentArgs<ExtArgs>
  }

  export type $AgentPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Agent"
    objects: {
      department: Prisma.$DepartmentPayload<ExtArgs> | null
      conversations: Prisma.$ConversationPayload<ExtArgs>[]
      messages: Prisma.$MessagePayload<ExtArgs>[]
      ownedShortcuts: Prisma.$ShortcutPayload<ExtArgs>[]
      createdShortcuts: Prisma.$ShortcutPayload<ExtArgs>[]
      updatedShortcuts: Prisma.$ShortcutPayload<ExtArgs>[]
      shortcutAudits: Prisma.$ShortcutAuditPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      email: string
      password: string
      role: string
      isActive: boolean
      departmentId: string | null
      isOnline: boolean
      createdAt: Date
    }, ExtArgs["result"]["agent"]>
    composites: {}
  }

  type AgentGetPayload<S extends boolean | null | undefined | AgentDefaultArgs> = $Result.GetResult<Prisma.$AgentPayload, S>

  type AgentCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<AgentFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: AgentCountAggregateInputType | true
    }

  export interface AgentDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Agent'], meta: { name: 'Agent' } }
    /**
     * Find zero or one Agent that matches the filter.
     * @param {AgentFindUniqueArgs} args - Arguments to find a Agent
     * @example
     * // Get one Agent
     * const agent = await prisma.agent.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AgentFindUniqueArgs>(args: SelectSubset<T, AgentFindUniqueArgs<ExtArgs>>): Prisma__AgentClient<$Result.GetResult<Prisma.$AgentPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Agent that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {AgentFindUniqueOrThrowArgs} args - Arguments to find a Agent
     * @example
     * // Get one Agent
     * const agent = await prisma.agent.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AgentFindUniqueOrThrowArgs>(args: SelectSubset<T, AgentFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AgentClient<$Result.GetResult<Prisma.$AgentPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Agent that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AgentFindFirstArgs} args - Arguments to find a Agent
     * @example
     * // Get one Agent
     * const agent = await prisma.agent.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AgentFindFirstArgs>(args?: SelectSubset<T, AgentFindFirstArgs<ExtArgs>>): Prisma__AgentClient<$Result.GetResult<Prisma.$AgentPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Agent that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AgentFindFirstOrThrowArgs} args - Arguments to find a Agent
     * @example
     * // Get one Agent
     * const agent = await prisma.agent.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AgentFindFirstOrThrowArgs>(args?: SelectSubset<T, AgentFindFirstOrThrowArgs<ExtArgs>>): Prisma__AgentClient<$Result.GetResult<Prisma.$AgentPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Agents that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AgentFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Agents
     * const agents = await prisma.agent.findMany()
     * 
     * // Get first 10 Agents
     * const agents = await prisma.agent.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const agentWithIdOnly = await prisma.agent.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AgentFindManyArgs>(args?: SelectSubset<T, AgentFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AgentPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Agent.
     * @param {AgentCreateArgs} args - Arguments to create a Agent.
     * @example
     * // Create one Agent
     * const Agent = await prisma.agent.create({
     *   data: {
     *     // ... data to create a Agent
     *   }
     * })
     * 
     */
    create<T extends AgentCreateArgs>(args: SelectSubset<T, AgentCreateArgs<ExtArgs>>): Prisma__AgentClient<$Result.GetResult<Prisma.$AgentPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Agents.
     * @param {AgentCreateManyArgs} args - Arguments to create many Agents.
     * @example
     * // Create many Agents
     * const agent = await prisma.agent.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AgentCreateManyArgs>(args?: SelectSubset<T, AgentCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Agents and returns the data saved in the database.
     * @param {AgentCreateManyAndReturnArgs} args - Arguments to create many Agents.
     * @example
     * // Create many Agents
     * const agent = await prisma.agent.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Agents and only return the `id`
     * const agentWithIdOnly = await prisma.agent.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AgentCreateManyAndReturnArgs>(args?: SelectSubset<T, AgentCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AgentPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Agent.
     * @param {AgentDeleteArgs} args - Arguments to delete one Agent.
     * @example
     * // Delete one Agent
     * const Agent = await prisma.agent.delete({
     *   where: {
     *     // ... filter to delete one Agent
     *   }
     * })
     * 
     */
    delete<T extends AgentDeleteArgs>(args: SelectSubset<T, AgentDeleteArgs<ExtArgs>>): Prisma__AgentClient<$Result.GetResult<Prisma.$AgentPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Agent.
     * @param {AgentUpdateArgs} args - Arguments to update one Agent.
     * @example
     * // Update one Agent
     * const agent = await prisma.agent.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AgentUpdateArgs>(args: SelectSubset<T, AgentUpdateArgs<ExtArgs>>): Prisma__AgentClient<$Result.GetResult<Prisma.$AgentPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Agents.
     * @param {AgentDeleteManyArgs} args - Arguments to filter Agents to delete.
     * @example
     * // Delete a few Agents
     * const { count } = await prisma.agent.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AgentDeleteManyArgs>(args?: SelectSubset<T, AgentDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Agents.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AgentUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Agents
     * const agent = await prisma.agent.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AgentUpdateManyArgs>(args: SelectSubset<T, AgentUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Agent.
     * @param {AgentUpsertArgs} args - Arguments to update or create a Agent.
     * @example
     * // Update or create a Agent
     * const agent = await prisma.agent.upsert({
     *   create: {
     *     // ... data to create a Agent
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Agent we want to update
     *   }
     * })
     */
    upsert<T extends AgentUpsertArgs>(args: SelectSubset<T, AgentUpsertArgs<ExtArgs>>): Prisma__AgentClient<$Result.GetResult<Prisma.$AgentPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Agents.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AgentCountArgs} args - Arguments to filter Agents to count.
     * @example
     * // Count the number of Agents
     * const count = await prisma.agent.count({
     *   where: {
     *     // ... the filter for the Agents we want to count
     *   }
     * })
    **/
    count<T extends AgentCountArgs>(
      args?: Subset<T, AgentCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AgentCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Agent.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AgentAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AgentAggregateArgs>(args: Subset<T, AgentAggregateArgs>): Prisma.PrismaPromise<GetAgentAggregateType<T>>

    /**
     * Group by Agent.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AgentGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AgentGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AgentGroupByArgs['orderBy'] }
        : { orderBy?: AgentGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AgentGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAgentGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Agent model
   */
  readonly fields: AgentFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Agent.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AgentClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    department<T extends Agent$departmentArgs<ExtArgs> = {}>(args?: Subset<T, Agent$departmentArgs<ExtArgs>>): Prisma__DepartmentClient<$Result.GetResult<Prisma.$DepartmentPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    conversations<T extends Agent$conversationsArgs<ExtArgs> = {}>(args?: Subset<T, Agent$conversationsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ConversationPayload<ExtArgs>, T, "findMany"> | Null>
    messages<T extends Agent$messagesArgs<ExtArgs> = {}>(args?: Subset<T, Agent$messagesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MessagePayload<ExtArgs>, T, "findMany"> | Null>
    ownedShortcuts<T extends Agent$ownedShortcutsArgs<ExtArgs> = {}>(args?: Subset<T, Agent$ownedShortcutsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ShortcutPayload<ExtArgs>, T, "findMany"> | Null>
    createdShortcuts<T extends Agent$createdShortcutsArgs<ExtArgs> = {}>(args?: Subset<T, Agent$createdShortcutsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ShortcutPayload<ExtArgs>, T, "findMany"> | Null>
    updatedShortcuts<T extends Agent$updatedShortcutsArgs<ExtArgs> = {}>(args?: Subset<T, Agent$updatedShortcutsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ShortcutPayload<ExtArgs>, T, "findMany"> | Null>
    shortcutAudits<T extends Agent$shortcutAuditsArgs<ExtArgs> = {}>(args?: Subset<T, Agent$shortcutAuditsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ShortcutAuditPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Agent model
   */ 
  interface AgentFieldRefs {
    readonly id: FieldRef<"Agent", 'String'>
    readonly name: FieldRef<"Agent", 'String'>
    readonly email: FieldRef<"Agent", 'String'>
    readonly password: FieldRef<"Agent", 'String'>
    readonly role: FieldRef<"Agent", 'String'>
    readonly isActive: FieldRef<"Agent", 'Boolean'>
    readonly departmentId: FieldRef<"Agent", 'String'>
    readonly isOnline: FieldRef<"Agent", 'Boolean'>
    readonly createdAt: FieldRef<"Agent", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Agent findUnique
   */
  export type AgentFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Agent
     */
    select?: AgentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgentInclude<ExtArgs> | null
    /**
     * Filter, which Agent to fetch.
     */
    where: AgentWhereUniqueInput
  }

  /**
   * Agent findUniqueOrThrow
   */
  export type AgentFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Agent
     */
    select?: AgentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgentInclude<ExtArgs> | null
    /**
     * Filter, which Agent to fetch.
     */
    where: AgentWhereUniqueInput
  }

  /**
   * Agent findFirst
   */
  export type AgentFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Agent
     */
    select?: AgentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgentInclude<ExtArgs> | null
    /**
     * Filter, which Agent to fetch.
     */
    where?: AgentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Agents to fetch.
     */
    orderBy?: AgentOrderByWithRelationInput | AgentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Agents.
     */
    cursor?: AgentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Agents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Agents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Agents.
     */
    distinct?: AgentScalarFieldEnum | AgentScalarFieldEnum[]
  }

  /**
   * Agent findFirstOrThrow
   */
  export type AgentFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Agent
     */
    select?: AgentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgentInclude<ExtArgs> | null
    /**
     * Filter, which Agent to fetch.
     */
    where?: AgentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Agents to fetch.
     */
    orderBy?: AgentOrderByWithRelationInput | AgentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Agents.
     */
    cursor?: AgentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Agents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Agents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Agents.
     */
    distinct?: AgentScalarFieldEnum | AgentScalarFieldEnum[]
  }

  /**
   * Agent findMany
   */
  export type AgentFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Agent
     */
    select?: AgentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgentInclude<ExtArgs> | null
    /**
     * Filter, which Agents to fetch.
     */
    where?: AgentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Agents to fetch.
     */
    orderBy?: AgentOrderByWithRelationInput | AgentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Agents.
     */
    cursor?: AgentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Agents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Agents.
     */
    skip?: number
    distinct?: AgentScalarFieldEnum | AgentScalarFieldEnum[]
  }

  /**
   * Agent create
   */
  export type AgentCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Agent
     */
    select?: AgentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgentInclude<ExtArgs> | null
    /**
     * The data needed to create a Agent.
     */
    data: XOR<AgentCreateInput, AgentUncheckedCreateInput>
  }

  /**
   * Agent createMany
   */
  export type AgentCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Agents.
     */
    data: AgentCreateManyInput | AgentCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Agent createManyAndReturn
   */
  export type AgentCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Agent
     */
    select?: AgentSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Agents.
     */
    data: AgentCreateManyInput | AgentCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgentIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Agent update
   */
  export type AgentUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Agent
     */
    select?: AgentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgentInclude<ExtArgs> | null
    /**
     * The data needed to update a Agent.
     */
    data: XOR<AgentUpdateInput, AgentUncheckedUpdateInput>
    /**
     * Choose, which Agent to update.
     */
    where: AgentWhereUniqueInput
  }

  /**
   * Agent updateMany
   */
  export type AgentUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Agents.
     */
    data: XOR<AgentUpdateManyMutationInput, AgentUncheckedUpdateManyInput>
    /**
     * Filter which Agents to update
     */
    where?: AgentWhereInput
  }

  /**
   * Agent upsert
   */
  export type AgentUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Agent
     */
    select?: AgentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgentInclude<ExtArgs> | null
    /**
     * The filter to search for the Agent to update in case it exists.
     */
    where: AgentWhereUniqueInput
    /**
     * In case the Agent found by the `where` argument doesn't exist, create a new Agent with this data.
     */
    create: XOR<AgentCreateInput, AgentUncheckedCreateInput>
    /**
     * In case the Agent was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AgentUpdateInput, AgentUncheckedUpdateInput>
  }

  /**
   * Agent delete
   */
  export type AgentDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Agent
     */
    select?: AgentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgentInclude<ExtArgs> | null
    /**
     * Filter which Agent to delete.
     */
    where: AgentWhereUniqueInput
  }

  /**
   * Agent deleteMany
   */
  export type AgentDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Agents to delete
     */
    where?: AgentWhereInput
  }

  /**
   * Agent.department
   */
  export type Agent$departmentArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Department
     */
    select?: DepartmentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DepartmentInclude<ExtArgs> | null
    where?: DepartmentWhereInput
  }

  /**
   * Agent.conversations
   */
  export type Agent$conversationsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Conversation
     */
    select?: ConversationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConversationInclude<ExtArgs> | null
    where?: ConversationWhereInput
    orderBy?: ConversationOrderByWithRelationInput | ConversationOrderByWithRelationInput[]
    cursor?: ConversationWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ConversationScalarFieldEnum | ConversationScalarFieldEnum[]
  }

  /**
   * Agent.messages
   */
  export type Agent$messagesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Message
     */
    select?: MessageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MessageInclude<ExtArgs> | null
    where?: MessageWhereInput
    orderBy?: MessageOrderByWithRelationInput | MessageOrderByWithRelationInput[]
    cursor?: MessageWhereUniqueInput
    take?: number
    skip?: number
    distinct?: MessageScalarFieldEnum | MessageScalarFieldEnum[]
  }

  /**
   * Agent.ownedShortcuts
   */
  export type Agent$ownedShortcutsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Shortcut
     */
    select?: ShortcutSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShortcutInclude<ExtArgs> | null
    where?: ShortcutWhereInput
    orderBy?: ShortcutOrderByWithRelationInput | ShortcutOrderByWithRelationInput[]
    cursor?: ShortcutWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ShortcutScalarFieldEnum | ShortcutScalarFieldEnum[]
  }

  /**
   * Agent.createdShortcuts
   */
  export type Agent$createdShortcutsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Shortcut
     */
    select?: ShortcutSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShortcutInclude<ExtArgs> | null
    where?: ShortcutWhereInput
    orderBy?: ShortcutOrderByWithRelationInput | ShortcutOrderByWithRelationInput[]
    cursor?: ShortcutWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ShortcutScalarFieldEnum | ShortcutScalarFieldEnum[]
  }

  /**
   * Agent.updatedShortcuts
   */
  export type Agent$updatedShortcutsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Shortcut
     */
    select?: ShortcutSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShortcutInclude<ExtArgs> | null
    where?: ShortcutWhereInput
    orderBy?: ShortcutOrderByWithRelationInput | ShortcutOrderByWithRelationInput[]
    cursor?: ShortcutWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ShortcutScalarFieldEnum | ShortcutScalarFieldEnum[]
  }

  /**
   * Agent.shortcutAudits
   */
  export type Agent$shortcutAuditsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ShortcutAudit
     */
    select?: ShortcutAuditSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShortcutAuditInclude<ExtArgs> | null
    where?: ShortcutAuditWhereInput
    orderBy?: ShortcutAuditOrderByWithRelationInput | ShortcutAuditOrderByWithRelationInput[]
    cursor?: ShortcutAuditWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ShortcutAuditScalarFieldEnum | ShortcutAuditScalarFieldEnum[]
  }

  /**
   * Agent without action
   */
  export type AgentDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Agent
     */
    select?: AgentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgentInclude<ExtArgs> | null
  }


  /**
   * Model RolePermission
   */

  export type AggregateRolePermission = {
    _count: RolePermissionCountAggregateOutputType | null
    _min: RolePermissionMinAggregateOutputType | null
    _max: RolePermissionMaxAggregateOutputType | null
  }

  export type RolePermissionMinAggregateOutputType = {
    id: string | null
    role: string | null
    resource: string | null
    updatedAt: Date | null
  }

  export type RolePermissionMaxAggregateOutputType = {
    id: string | null
    role: string | null
    resource: string | null
    updatedAt: Date | null
  }

  export type RolePermissionCountAggregateOutputType = {
    id: number
    role: number
    resource: number
    actions: number
    updatedAt: number
    _all: number
  }


  export type RolePermissionMinAggregateInputType = {
    id?: true
    role?: true
    resource?: true
    updatedAt?: true
  }

  export type RolePermissionMaxAggregateInputType = {
    id?: true
    role?: true
    resource?: true
    updatedAt?: true
  }

  export type RolePermissionCountAggregateInputType = {
    id?: true
    role?: true
    resource?: true
    actions?: true
    updatedAt?: true
    _all?: true
  }

  export type RolePermissionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which RolePermission to aggregate.
     */
    where?: RolePermissionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RolePermissions to fetch.
     */
    orderBy?: RolePermissionOrderByWithRelationInput | RolePermissionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: RolePermissionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RolePermissions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RolePermissions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned RolePermissions
    **/
    _count?: true | RolePermissionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: RolePermissionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: RolePermissionMaxAggregateInputType
  }

  export type GetRolePermissionAggregateType<T extends RolePermissionAggregateArgs> = {
        [P in keyof T & keyof AggregateRolePermission]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateRolePermission[P]>
      : GetScalarType<T[P], AggregateRolePermission[P]>
  }




  export type RolePermissionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RolePermissionWhereInput
    orderBy?: RolePermissionOrderByWithAggregationInput | RolePermissionOrderByWithAggregationInput[]
    by: RolePermissionScalarFieldEnum[] | RolePermissionScalarFieldEnum
    having?: RolePermissionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: RolePermissionCountAggregateInputType | true
    _min?: RolePermissionMinAggregateInputType
    _max?: RolePermissionMaxAggregateInputType
  }

  export type RolePermissionGroupByOutputType = {
    id: string
    role: string
    resource: string
    actions: string[]
    updatedAt: Date
    _count: RolePermissionCountAggregateOutputType | null
    _min: RolePermissionMinAggregateOutputType | null
    _max: RolePermissionMaxAggregateOutputType | null
  }

  type GetRolePermissionGroupByPayload<T extends RolePermissionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<RolePermissionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof RolePermissionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], RolePermissionGroupByOutputType[P]>
            : GetScalarType<T[P], RolePermissionGroupByOutputType[P]>
        }
      >
    >


  export type RolePermissionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    role?: boolean
    resource?: boolean
    actions?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["rolePermission"]>

  export type RolePermissionSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    role?: boolean
    resource?: boolean
    actions?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["rolePermission"]>

  export type RolePermissionSelectScalar = {
    id?: boolean
    role?: boolean
    resource?: boolean
    actions?: boolean
    updatedAt?: boolean
  }


  export type $RolePermissionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "RolePermission"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      role: string
      resource: string
      actions: string[]
      updatedAt: Date
    }, ExtArgs["result"]["rolePermission"]>
    composites: {}
  }

  type RolePermissionGetPayload<S extends boolean | null | undefined | RolePermissionDefaultArgs> = $Result.GetResult<Prisma.$RolePermissionPayload, S>

  type RolePermissionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<RolePermissionFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: RolePermissionCountAggregateInputType | true
    }

  export interface RolePermissionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['RolePermission'], meta: { name: 'RolePermission' } }
    /**
     * Find zero or one RolePermission that matches the filter.
     * @param {RolePermissionFindUniqueArgs} args - Arguments to find a RolePermission
     * @example
     * // Get one RolePermission
     * const rolePermission = await prisma.rolePermission.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends RolePermissionFindUniqueArgs>(args: SelectSubset<T, RolePermissionFindUniqueArgs<ExtArgs>>): Prisma__RolePermissionClient<$Result.GetResult<Prisma.$RolePermissionPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one RolePermission that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {RolePermissionFindUniqueOrThrowArgs} args - Arguments to find a RolePermission
     * @example
     * // Get one RolePermission
     * const rolePermission = await prisma.rolePermission.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends RolePermissionFindUniqueOrThrowArgs>(args: SelectSubset<T, RolePermissionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__RolePermissionClient<$Result.GetResult<Prisma.$RolePermissionPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first RolePermission that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RolePermissionFindFirstArgs} args - Arguments to find a RolePermission
     * @example
     * // Get one RolePermission
     * const rolePermission = await prisma.rolePermission.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends RolePermissionFindFirstArgs>(args?: SelectSubset<T, RolePermissionFindFirstArgs<ExtArgs>>): Prisma__RolePermissionClient<$Result.GetResult<Prisma.$RolePermissionPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first RolePermission that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RolePermissionFindFirstOrThrowArgs} args - Arguments to find a RolePermission
     * @example
     * // Get one RolePermission
     * const rolePermission = await prisma.rolePermission.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends RolePermissionFindFirstOrThrowArgs>(args?: SelectSubset<T, RolePermissionFindFirstOrThrowArgs<ExtArgs>>): Prisma__RolePermissionClient<$Result.GetResult<Prisma.$RolePermissionPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more RolePermissions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RolePermissionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all RolePermissions
     * const rolePermissions = await prisma.rolePermission.findMany()
     * 
     * // Get first 10 RolePermissions
     * const rolePermissions = await prisma.rolePermission.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const rolePermissionWithIdOnly = await prisma.rolePermission.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends RolePermissionFindManyArgs>(args?: SelectSubset<T, RolePermissionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RolePermissionPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a RolePermission.
     * @param {RolePermissionCreateArgs} args - Arguments to create a RolePermission.
     * @example
     * // Create one RolePermission
     * const RolePermission = await prisma.rolePermission.create({
     *   data: {
     *     // ... data to create a RolePermission
     *   }
     * })
     * 
     */
    create<T extends RolePermissionCreateArgs>(args: SelectSubset<T, RolePermissionCreateArgs<ExtArgs>>): Prisma__RolePermissionClient<$Result.GetResult<Prisma.$RolePermissionPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many RolePermissions.
     * @param {RolePermissionCreateManyArgs} args - Arguments to create many RolePermissions.
     * @example
     * // Create many RolePermissions
     * const rolePermission = await prisma.rolePermission.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends RolePermissionCreateManyArgs>(args?: SelectSubset<T, RolePermissionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many RolePermissions and returns the data saved in the database.
     * @param {RolePermissionCreateManyAndReturnArgs} args - Arguments to create many RolePermissions.
     * @example
     * // Create many RolePermissions
     * const rolePermission = await prisma.rolePermission.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many RolePermissions and only return the `id`
     * const rolePermissionWithIdOnly = await prisma.rolePermission.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends RolePermissionCreateManyAndReturnArgs>(args?: SelectSubset<T, RolePermissionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RolePermissionPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a RolePermission.
     * @param {RolePermissionDeleteArgs} args - Arguments to delete one RolePermission.
     * @example
     * // Delete one RolePermission
     * const RolePermission = await prisma.rolePermission.delete({
     *   where: {
     *     // ... filter to delete one RolePermission
     *   }
     * })
     * 
     */
    delete<T extends RolePermissionDeleteArgs>(args: SelectSubset<T, RolePermissionDeleteArgs<ExtArgs>>): Prisma__RolePermissionClient<$Result.GetResult<Prisma.$RolePermissionPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one RolePermission.
     * @param {RolePermissionUpdateArgs} args - Arguments to update one RolePermission.
     * @example
     * // Update one RolePermission
     * const rolePermission = await prisma.rolePermission.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends RolePermissionUpdateArgs>(args: SelectSubset<T, RolePermissionUpdateArgs<ExtArgs>>): Prisma__RolePermissionClient<$Result.GetResult<Prisma.$RolePermissionPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more RolePermissions.
     * @param {RolePermissionDeleteManyArgs} args - Arguments to filter RolePermissions to delete.
     * @example
     * // Delete a few RolePermissions
     * const { count } = await prisma.rolePermission.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends RolePermissionDeleteManyArgs>(args?: SelectSubset<T, RolePermissionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more RolePermissions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RolePermissionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many RolePermissions
     * const rolePermission = await prisma.rolePermission.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends RolePermissionUpdateManyArgs>(args: SelectSubset<T, RolePermissionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one RolePermission.
     * @param {RolePermissionUpsertArgs} args - Arguments to update or create a RolePermission.
     * @example
     * // Update or create a RolePermission
     * const rolePermission = await prisma.rolePermission.upsert({
     *   create: {
     *     // ... data to create a RolePermission
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the RolePermission we want to update
     *   }
     * })
     */
    upsert<T extends RolePermissionUpsertArgs>(args: SelectSubset<T, RolePermissionUpsertArgs<ExtArgs>>): Prisma__RolePermissionClient<$Result.GetResult<Prisma.$RolePermissionPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of RolePermissions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RolePermissionCountArgs} args - Arguments to filter RolePermissions to count.
     * @example
     * // Count the number of RolePermissions
     * const count = await prisma.rolePermission.count({
     *   where: {
     *     // ... the filter for the RolePermissions we want to count
     *   }
     * })
    **/
    count<T extends RolePermissionCountArgs>(
      args?: Subset<T, RolePermissionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], RolePermissionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a RolePermission.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RolePermissionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends RolePermissionAggregateArgs>(args: Subset<T, RolePermissionAggregateArgs>): Prisma.PrismaPromise<GetRolePermissionAggregateType<T>>

    /**
     * Group by RolePermission.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RolePermissionGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends RolePermissionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: RolePermissionGroupByArgs['orderBy'] }
        : { orderBy?: RolePermissionGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, RolePermissionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetRolePermissionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the RolePermission model
   */
  readonly fields: RolePermissionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for RolePermission.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__RolePermissionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the RolePermission model
   */ 
  interface RolePermissionFieldRefs {
    readonly id: FieldRef<"RolePermission", 'String'>
    readonly role: FieldRef<"RolePermission", 'String'>
    readonly resource: FieldRef<"RolePermission", 'String'>
    readonly actions: FieldRef<"RolePermission", 'String[]'>
    readonly updatedAt: FieldRef<"RolePermission", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * RolePermission findUnique
   */
  export type RolePermissionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RolePermission
     */
    select?: RolePermissionSelect<ExtArgs> | null
    /**
     * Filter, which RolePermission to fetch.
     */
    where: RolePermissionWhereUniqueInput
  }

  /**
   * RolePermission findUniqueOrThrow
   */
  export type RolePermissionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RolePermission
     */
    select?: RolePermissionSelect<ExtArgs> | null
    /**
     * Filter, which RolePermission to fetch.
     */
    where: RolePermissionWhereUniqueInput
  }

  /**
   * RolePermission findFirst
   */
  export type RolePermissionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RolePermission
     */
    select?: RolePermissionSelect<ExtArgs> | null
    /**
     * Filter, which RolePermission to fetch.
     */
    where?: RolePermissionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RolePermissions to fetch.
     */
    orderBy?: RolePermissionOrderByWithRelationInput | RolePermissionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for RolePermissions.
     */
    cursor?: RolePermissionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RolePermissions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RolePermissions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of RolePermissions.
     */
    distinct?: RolePermissionScalarFieldEnum | RolePermissionScalarFieldEnum[]
  }

  /**
   * RolePermission findFirstOrThrow
   */
  export type RolePermissionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RolePermission
     */
    select?: RolePermissionSelect<ExtArgs> | null
    /**
     * Filter, which RolePermission to fetch.
     */
    where?: RolePermissionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RolePermissions to fetch.
     */
    orderBy?: RolePermissionOrderByWithRelationInput | RolePermissionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for RolePermissions.
     */
    cursor?: RolePermissionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RolePermissions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RolePermissions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of RolePermissions.
     */
    distinct?: RolePermissionScalarFieldEnum | RolePermissionScalarFieldEnum[]
  }

  /**
   * RolePermission findMany
   */
  export type RolePermissionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RolePermission
     */
    select?: RolePermissionSelect<ExtArgs> | null
    /**
     * Filter, which RolePermissions to fetch.
     */
    where?: RolePermissionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RolePermissions to fetch.
     */
    orderBy?: RolePermissionOrderByWithRelationInput | RolePermissionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing RolePermissions.
     */
    cursor?: RolePermissionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RolePermissions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RolePermissions.
     */
    skip?: number
    distinct?: RolePermissionScalarFieldEnum | RolePermissionScalarFieldEnum[]
  }

  /**
   * RolePermission create
   */
  export type RolePermissionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RolePermission
     */
    select?: RolePermissionSelect<ExtArgs> | null
    /**
     * The data needed to create a RolePermission.
     */
    data: XOR<RolePermissionCreateInput, RolePermissionUncheckedCreateInput>
  }

  /**
   * RolePermission createMany
   */
  export type RolePermissionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many RolePermissions.
     */
    data: RolePermissionCreateManyInput | RolePermissionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * RolePermission createManyAndReturn
   */
  export type RolePermissionCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RolePermission
     */
    select?: RolePermissionSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many RolePermissions.
     */
    data: RolePermissionCreateManyInput | RolePermissionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * RolePermission update
   */
  export type RolePermissionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RolePermission
     */
    select?: RolePermissionSelect<ExtArgs> | null
    /**
     * The data needed to update a RolePermission.
     */
    data: XOR<RolePermissionUpdateInput, RolePermissionUncheckedUpdateInput>
    /**
     * Choose, which RolePermission to update.
     */
    where: RolePermissionWhereUniqueInput
  }

  /**
   * RolePermission updateMany
   */
  export type RolePermissionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update RolePermissions.
     */
    data: XOR<RolePermissionUpdateManyMutationInput, RolePermissionUncheckedUpdateManyInput>
    /**
     * Filter which RolePermissions to update
     */
    where?: RolePermissionWhereInput
  }

  /**
   * RolePermission upsert
   */
  export type RolePermissionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RolePermission
     */
    select?: RolePermissionSelect<ExtArgs> | null
    /**
     * The filter to search for the RolePermission to update in case it exists.
     */
    where: RolePermissionWhereUniqueInput
    /**
     * In case the RolePermission found by the `where` argument doesn't exist, create a new RolePermission with this data.
     */
    create: XOR<RolePermissionCreateInput, RolePermissionUncheckedCreateInput>
    /**
     * In case the RolePermission was found with the provided `where` argument, update it with this data.
     */
    update: XOR<RolePermissionUpdateInput, RolePermissionUncheckedUpdateInput>
  }

  /**
   * RolePermission delete
   */
  export type RolePermissionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RolePermission
     */
    select?: RolePermissionSelect<ExtArgs> | null
    /**
     * Filter which RolePermission to delete.
     */
    where: RolePermissionWhereUniqueInput
  }

  /**
   * RolePermission deleteMany
   */
  export type RolePermissionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which RolePermissions to delete
     */
    where?: RolePermissionWhereInput
  }

  /**
   * RolePermission without action
   */
  export type RolePermissionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RolePermission
     */
    select?: RolePermissionSelect<ExtArgs> | null
  }


  /**
   * Model Contact
   */

  export type AggregateContact = {
    _count: ContactCountAggregateOutputType | null
    _min: ContactMinAggregateOutputType | null
    _max: ContactMaxAggregateOutputType | null
  }

  export type ContactMinAggregateOutputType = {
    id: string | null
    phone: string | null
    name: string | null
    createdAt: Date | null
  }

  export type ContactMaxAggregateOutputType = {
    id: string | null
    phone: string | null
    name: string | null
    createdAt: Date | null
  }

  export type ContactCountAggregateOutputType = {
    id: number
    phone: number
    name: number
    createdAt: number
    _all: number
  }


  export type ContactMinAggregateInputType = {
    id?: true
    phone?: true
    name?: true
    createdAt?: true
  }

  export type ContactMaxAggregateInputType = {
    id?: true
    phone?: true
    name?: true
    createdAt?: true
  }

  export type ContactCountAggregateInputType = {
    id?: true
    phone?: true
    name?: true
    createdAt?: true
    _all?: true
  }

  export type ContactAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Contact to aggregate.
     */
    where?: ContactWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Contacts to fetch.
     */
    orderBy?: ContactOrderByWithRelationInput | ContactOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ContactWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Contacts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Contacts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Contacts
    **/
    _count?: true | ContactCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ContactMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ContactMaxAggregateInputType
  }

  export type GetContactAggregateType<T extends ContactAggregateArgs> = {
        [P in keyof T & keyof AggregateContact]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateContact[P]>
      : GetScalarType<T[P], AggregateContact[P]>
  }




  export type ContactGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ContactWhereInput
    orderBy?: ContactOrderByWithAggregationInput | ContactOrderByWithAggregationInput[]
    by: ContactScalarFieldEnum[] | ContactScalarFieldEnum
    having?: ContactScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ContactCountAggregateInputType | true
    _min?: ContactMinAggregateInputType
    _max?: ContactMaxAggregateInputType
  }

  export type ContactGroupByOutputType = {
    id: string
    phone: string
    name: string
    createdAt: Date
    _count: ContactCountAggregateOutputType | null
    _min: ContactMinAggregateOutputType | null
    _max: ContactMaxAggregateOutputType | null
  }

  type GetContactGroupByPayload<T extends ContactGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ContactGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ContactGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ContactGroupByOutputType[P]>
            : GetScalarType<T[P], ContactGroupByOutputType[P]>
        }
      >
    >


  export type ContactSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    phone?: boolean
    name?: boolean
    createdAt?: boolean
    conversations?: boolean | Contact$conversationsArgs<ExtArgs>
    _count?: boolean | ContactCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["contact"]>

  export type ContactSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    phone?: boolean
    name?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["contact"]>

  export type ContactSelectScalar = {
    id?: boolean
    phone?: boolean
    name?: boolean
    createdAt?: boolean
  }

  export type ContactInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    conversations?: boolean | Contact$conversationsArgs<ExtArgs>
    _count?: boolean | ContactCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type ContactIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $ContactPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Contact"
    objects: {
      conversations: Prisma.$ConversationPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      phone: string
      name: string
      createdAt: Date
    }, ExtArgs["result"]["contact"]>
    composites: {}
  }

  type ContactGetPayload<S extends boolean | null | undefined | ContactDefaultArgs> = $Result.GetResult<Prisma.$ContactPayload, S>

  type ContactCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<ContactFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: ContactCountAggregateInputType | true
    }

  export interface ContactDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Contact'], meta: { name: 'Contact' } }
    /**
     * Find zero or one Contact that matches the filter.
     * @param {ContactFindUniqueArgs} args - Arguments to find a Contact
     * @example
     * // Get one Contact
     * const contact = await prisma.contact.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ContactFindUniqueArgs>(args: SelectSubset<T, ContactFindUniqueArgs<ExtArgs>>): Prisma__ContactClient<$Result.GetResult<Prisma.$ContactPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Contact that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {ContactFindUniqueOrThrowArgs} args - Arguments to find a Contact
     * @example
     * // Get one Contact
     * const contact = await prisma.contact.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ContactFindUniqueOrThrowArgs>(args: SelectSubset<T, ContactFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ContactClient<$Result.GetResult<Prisma.$ContactPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Contact that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ContactFindFirstArgs} args - Arguments to find a Contact
     * @example
     * // Get one Contact
     * const contact = await prisma.contact.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ContactFindFirstArgs>(args?: SelectSubset<T, ContactFindFirstArgs<ExtArgs>>): Prisma__ContactClient<$Result.GetResult<Prisma.$ContactPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Contact that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ContactFindFirstOrThrowArgs} args - Arguments to find a Contact
     * @example
     * // Get one Contact
     * const contact = await prisma.contact.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ContactFindFirstOrThrowArgs>(args?: SelectSubset<T, ContactFindFirstOrThrowArgs<ExtArgs>>): Prisma__ContactClient<$Result.GetResult<Prisma.$ContactPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Contacts that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ContactFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Contacts
     * const contacts = await prisma.contact.findMany()
     * 
     * // Get first 10 Contacts
     * const contacts = await prisma.contact.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const contactWithIdOnly = await prisma.contact.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ContactFindManyArgs>(args?: SelectSubset<T, ContactFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ContactPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Contact.
     * @param {ContactCreateArgs} args - Arguments to create a Contact.
     * @example
     * // Create one Contact
     * const Contact = await prisma.contact.create({
     *   data: {
     *     // ... data to create a Contact
     *   }
     * })
     * 
     */
    create<T extends ContactCreateArgs>(args: SelectSubset<T, ContactCreateArgs<ExtArgs>>): Prisma__ContactClient<$Result.GetResult<Prisma.$ContactPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Contacts.
     * @param {ContactCreateManyArgs} args - Arguments to create many Contacts.
     * @example
     * // Create many Contacts
     * const contact = await prisma.contact.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ContactCreateManyArgs>(args?: SelectSubset<T, ContactCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Contacts and returns the data saved in the database.
     * @param {ContactCreateManyAndReturnArgs} args - Arguments to create many Contacts.
     * @example
     * // Create many Contacts
     * const contact = await prisma.contact.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Contacts and only return the `id`
     * const contactWithIdOnly = await prisma.contact.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ContactCreateManyAndReturnArgs>(args?: SelectSubset<T, ContactCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ContactPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Contact.
     * @param {ContactDeleteArgs} args - Arguments to delete one Contact.
     * @example
     * // Delete one Contact
     * const Contact = await prisma.contact.delete({
     *   where: {
     *     // ... filter to delete one Contact
     *   }
     * })
     * 
     */
    delete<T extends ContactDeleteArgs>(args: SelectSubset<T, ContactDeleteArgs<ExtArgs>>): Prisma__ContactClient<$Result.GetResult<Prisma.$ContactPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Contact.
     * @param {ContactUpdateArgs} args - Arguments to update one Contact.
     * @example
     * // Update one Contact
     * const contact = await prisma.contact.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ContactUpdateArgs>(args: SelectSubset<T, ContactUpdateArgs<ExtArgs>>): Prisma__ContactClient<$Result.GetResult<Prisma.$ContactPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Contacts.
     * @param {ContactDeleteManyArgs} args - Arguments to filter Contacts to delete.
     * @example
     * // Delete a few Contacts
     * const { count } = await prisma.contact.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ContactDeleteManyArgs>(args?: SelectSubset<T, ContactDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Contacts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ContactUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Contacts
     * const contact = await prisma.contact.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ContactUpdateManyArgs>(args: SelectSubset<T, ContactUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Contact.
     * @param {ContactUpsertArgs} args - Arguments to update or create a Contact.
     * @example
     * // Update or create a Contact
     * const contact = await prisma.contact.upsert({
     *   create: {
     *     // ... data to create a Contact
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Contact we want to update
     *   }
     * })
     */
    upsert<T extends ContactUpsertArgs>(args: SelectSubset<T, ContactUpsertArgs<ExtArgs>>): Prisma__ContactClient<$Result.GetResult<Prisma.$ContactPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Contacts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ContactCountArgs} args - Arguments to filter Contacts to count.
     * @example
     * // Count the number of Contacts
     * const count = await prisma.contact.count({
     *   where: {
     *     // ... the filter for the Contacts we want to count
     *   }
     * })
    **/
    count<T extends ContactCountArgs>(
      args?: Subset<T, ContactCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ContactCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Contact.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ContactAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ContactAggregateArgs>(args: Subset<T, ContactAggregateArgs>): Prisma.PrismaPromise<GetContactAggregateType<T>>

    /**
     * Group by Contact.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ContactGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ContactGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ContactGroupByArgs['orderBy'] }
        : { orderBy?: ContactGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ContactGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetContactGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Contact model
   */
  readonly fields: ContactFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Contact.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ContactClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    conversations<T extends Contact$conversationsArgs<ExtArgs> = {}>(args?: Subset<T, Contact$conversationsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ConversationPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Contact model
   */ 
  interface ContactFieldRefs {
    readonly id: FieldRef<"Contact", 'String'>
    readonly phone: FieldRef<"Contact", 'String'>
    readonly name: FieldRef<"Contact", 'String'>
    readonly createdAt: FieldRef<"Contact", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Contact findUnique
   */
  export type ContactFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Contact
     */
    select?: ContactSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ContactInclude<ExtArgs> | null
    /**
     * Filter, which Contact to fetch.
     */
    where: ContactWhereUniqueInput
  }

  /**
   * Contact findUniqueOrThrow
   */
  export type ContactFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Contact
     */
    select?: ContactSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ContactInclude<ExtArgs> | null
    /**
     * Filter, which Contact to fetch.
     */
    where: ContactWhereUniqueInput
  }

  /**
   * Contact findFirst
   */
  export type ContactFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Contact
     */
    select?: ContactSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ContactInclude<ExtArgs> | null
    /**
     * Filter, which Contact to fetch.
     */
    where?: ContactWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Contacts to fetch.
     */
    orderBy?: ContactOrderByWithRelationInput | ContactOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Contacts.
     */
    cursor?: ContactWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Contacts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Contacts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Contacts.
     */
    distinct?: ContactScalarFieldEnum | ContactScalarFieldEnum[]
  }

  /**
   * Contact findFirstOrThrow
   */
  export type ContactFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Contact
     */
    select?: ContactSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ContactInclude<ExtArgs> | null
    /**
     * Filter, which Contact to fetch.
     */
    where?: ContactWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Contacts to fetch.
     */
    orderBy?: ContactOrderByWithRelationInput | ContactOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Contacts.
     */
    cursor?: ContactWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Contacts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Contacts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Contacts.
     */
    distinct?: ContactScalarFieldEnum | ContactScalarFieldEnum[]
  }

  /**
   * Contact findMany
   */
  export type ContactFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Contact
     */
    select?: ContactSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ContactInclude<ExtArgs> | null
    /**
     * Filter, which Contacts to fetch.
     */
    where?: ContactWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Contacts to fetch.
     */
    orderBy?: ContactOrderByWithRelationInput | ContactOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Contacts.
     */
    cursor?: ContactWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Contacts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Contacts.
     */
    skip?: number
    distinct?: ContactScalarFieldEnum | ContactScalarFieldEnum[]
  }

  /**
   * Contact create
   */
  export type ContactCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Contact
     */
    select?: ContactSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ContactInclude<ExtArgs> | null
    /**
     * The data needed to create a Contact.
     */
    data: XOR<ContactCreateInput, ContactUncheckedCreateInput>
  }

  /**
   * Contact createMany
   */
  export type ContactCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Contacts.
     */
    data: ContactCreateManyInput | ContactCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Contact createManyAndReturn
   */
  export type ContactCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Contact
     */
    select?: ContactSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Contacts.
     */
    data: ContactCreateManyInput | ContactCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Contact update
   */
  export type ContactUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Contact
     */
    select?: ContactSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ContactInclude<ExtArgs> | null
    /**
     * The data needed to update a Contact.
     */
    data: XOR<ContactUpdateInput, ContactUncheckedUpdateInput>
    /**
     * Choose, which Contact to update.
     */
    where: ContactWhereUniqueInput
  }

  /**
   * Contact updateMany
   */
  export type ContactUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Contacts.
     */
    data: XOR<ContactUpdateManyMutationInput, ContactUncheckedUpdateManyInput>
    /**
     * Filter which Contacts to update
     */
    where?: ContactWhereInput
  }

  /**
   * Contact upsert
   */
  export type ContactUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Contact
     */
    select?: ContactSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ContactInclude<ExtArgs> | null
    /**
     * The filter to search for the Contact to update in case it exists.
     */
    where: ContactWhereUniqueInput
    /**
     * In case the Contact found by the `where` argument doesn't exist, create a new Contact with this data.
     */
    create: XOR<ContactCreateInput, ContactUncheckedCreateInput>
    /**
     * In case the Contact was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ContactUpdateInput, ContactUncheckedUpdateInput>
  }

  /**
   * Contact delete
   */
  export type ContactDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Contact
     */
    select?: ContactSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ContactInclude<ExtArgs> | null
    /**
     * Filter which Contact to delete.
     */
    where: ContactWhereUniqueInput
  }

  /**
   * Contact deleteMany
   */
  export type ContactDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Contacts to delete
     */
    where?: ContactWhereInput
  }

  /**
   * Contact.conversations
   */
  export type Contact$conversationsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Conversation
     */
    select?: ConversationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConversationInclude<ExtArgs> | null
    where?: ConversationWhereInput
    orderBy?: ConversationOrderByWithRelationInput | ConversationOrderByWithRelationInput[]
    cursor?: ConversationWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ConversationScalarFieldEnum | ConversationScalarFieldEnum[]
  }

  /**
   * Contact without action
   */
  export type ContactDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Contact
     */
    select?: ContactSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ContactInclude<ExtArgs> | null
  }


  /**
   * Model Conversation
   */

  export type AggregateConversation = {
    _count: ConversationCountAggregateOutputType | null
    _min: ConversationMinAggregateOutputType | null
    _max: ConversationMaxAggregateOutputType | null
  }

  export type ConversationMinAggregateOutputType = {
    id: string | null
    contactId: string | null
    status: string | null
    departmentId: string | null
    assignedAgentId: string | null
    currentStep: string | null
    startedAt: Date | null
    closedAt: Date | null
  }

  export type ConversationMaxAggregateOutputType = {
    id: string | null
    contactId: string | null
    status: string | null
    departmentId: string | null
    assignedAgentId: string | null
    currentStep: string | null
    startedAt: Date | null
    closedAt: Date | null
  }

  export type ConversationCountAggregateOutputType = {
    id: number
    contactId: number
    status: number
    departmentId: number
    assignedAgentId: number
    currentStep: number
    startedAt: number
    closedAt: number
    _all: number
  }


  export type ConversationMinAggregateInputType = {
    id?: true
    contactId?: true
    status?: true
    departmentId?: true
    assignedAgentId?: true
    currentStep?: true
    startedAt?: true
    closedAt?: true
  }

  export type ConversationMaxAggregateInputType = {
    id?: true
    contactId?: true
    status?: true
    departmentId?: true
    assignedAgentId?: true
    currentStep?: true
    startedAt?: true
    closedAt?: true
  }

  export type ConversationCountAggregateInputType = {
    id?: true
    contactId?: true
    status?: true
    departmentId?: true
    assignedAgentId?: true
    currentStep?: true
    startedAt?: true
    closedAt?: true
    _all?: true
  }

  export type ConversationAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Conversation to aggregate.
     */
    where?: ConversationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Conversations to fetch.
     */
    orderBy?: ConversationOrderByWithRelationInput | ConversationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ConversationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Conversations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Conversations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Conversations
    **/
    _count?: true | ConversationCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ConversationMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ConversationMaxAggregateInputType
  }

  export type GetConversationAggregateType<T extends ConversationAggregateArgs> = {
        [P in keyof T & keyof AggregateConversation]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateConversation[P]>
      : GetScalarType<T[P], AggregateConversation[P]>
  }




  export type ConversationGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ConversationWhereInput
    orderBy?: ConversationOrderByWithAggregationInput | ConversationOrderByWithAggregationInput[]
    by: ConversationScalarFieldEnum[] | ConversationScalarFieldEnum
    having?: ConversationScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ConversationCountAggregateInputType | true
    _min?: ConversationMinAggregateInputType
    _max?: ConversationMaxAggregateInputType
  }

  export type ConversationGroupByOutputType = {
    id: string
    contactId: string
    status: string
    departmentId: string | null
    assignedAgentId: string | null
    currentStep: string | null
    startedAt: Date
    closedAt: Date | null
    _count: ConversationCountAggregateOutputType | null
    _min: ConversationMinAggregateOutputType | null
    _max: ConversationMaxAggregateOutputType | null
  }

  type GetConversationGroupByPayload<T extends ConversationGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ConversationGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ConversationGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ConversationGroupByOutputType[P]>
            : GetScalarType<T[P], ConversationGroupByOutputType[P]>
        }
      >
    >


  export type ConversationSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    contactId?: boolean
    status?: boolean
    departmentId?: boolean
    assignedAgentId?: boolean
    currentStep?: boolean
    startedAt?: boolean
    closedAt?: boolean
    contact?: boolean | ContactDefaultArgs<ExtArgs>
    department?: boolean | Conversation$departmentArgs<ExtArgs>
    assignedAgent?: boolean | Conversation$assignedAgentArgs<ExtArgs>
    messages?: boolean | Conversation$messagesArgs<ExtArgs>
    _count?: boolean | ConversationCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["conversation"]>

  export type ConversationSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    contactId?: boolean
    status?: boolean
    departmentId?: boolean
    assignedAgentId?: boolean
    currentStep?: boolean
    startedAt?: boolean
    closedAt?: boolean
    contact?: boolean | ContactDefaultArgs<ExtArgs>
    department?: boolean | Conversation$departmentArgs<ExtArgs>
    assignedAgent?: boolean | Conversation$assignedAgentArgs<ExtArgs>
  }, ExtArgs["result"]["conversation"]>

  export type ConversationSelectScalar = {
    id?: boolean
    contactId?: boolean
    status?: boolean
    departmentId?: boolean
    assignedAgentId?: boolean
    currentStep?: boolean
    startedAt?: boolean
    closedAt?: boolean
  }

  export type ConversationInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    contact?: boolean | ContactDefaultArgs<ExtArgs>
    department?: boolean | Conversation$departmentArgs<ExtArgs>
    assignedAgent?: boolean | Conversation$assignedAgentArgs<ExtArgs>
    messages?: boolean | Conversation$messagesArgs<ExtArgs>
    _count?: boolean | ConversationCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type ConversationIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    contact?: boolean | ContactDefaultArgs<ExtArgs>
    department?: boolean | Conversation$departmentArgs<ExtArgs>
    assignedAgent?: boolean | Conversation$assignedAgentArgs<ExtArgs>
  }

  export type $ConversationPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Conversation"
    objects: {
      contact: Prisma.$ContactPayload<ExtArgs>
      department: Prisma.$DepartmentPayload<ExtArgs> | null
      assignedAgent: Prisma.$AgentPayload<ExtArgs> | null
      messages: Prisma.$MessagePayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      contactId: string
      status: string
      departmentId: string | null
      assignedAgentId: string | null
      currentStep: string | null
      startedAt: Date
      closedAt: Date | null
    }, ExtArgs["result"]["conversation"]>
    composites: {}
  }

  type ConversationGetPayload<S extends boolean | null | undefined | ConversationDefaultArgs> = $Result.GetResult<Prisma.$ConversationPayload, S>

  type ConversationCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<ConversationFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: ConversationCountAggregateInputType | true
    }

  export interface ConversationDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Conversation'], meta: { name: 'Conversation' } }
    /**
     * Find zero or one Conversation that matches the filter.
     * @param {ConversationFindUniqueArgs} args - Arguments to find a Conversation
     * @example
     * // Get one Conversation
     * const conversation = await prisma.conversation.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ConversationFindUniqueArgs>(args: SelectSubset<T, ConversationFindUniqueArgs<ExtArgs>>): Prisma__ConversationClient<$Result.GetResult<Prisma.$ConversationPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Conversation that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {ConversationFindUniqueOrThrowArgs} args - Arguments to find a Conversation
     * @example
     * // Get one Conversation
     * const conversation = await prisma.conversation.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ConversationFindUniqueOrThrowArgs>(args: SelectSubset<T, ConversationFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ConversationClient<$Result.GetResult<Prisma.$ConversationPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Conversation that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConversationFindFirstArgs} args - Arguments to find a Conversation
     * @example
     * // Get one Conversation
     * const conversation = await prisma.conversation.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ConversationFindFirstArgs>(args?: SelectSubset<T, ConversationFindFirstArgs<ExtArgs>>): Prisma__ConversationClient<$Result.GetResult<Prisma.$ConversationPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Conversation that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConversationFindFirstOrThrowArgs} args - Arguments to find a Conversation
     * @example
     * // Get one Conversation
     * const conversation = await prisma.conversation.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ConversationFindFirstOrThrowArgs>(args?: SelectSubset<T, ConversationFindFirstOrThrowArgs<ExtArgs>>): Prisma__ConversationClient<$Result.GetResult<Prisma.$ConversationPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Conversations that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConversationFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Conversations
     * const conversations = await prisma.conversation.findMany()
     * 
     * // Get first 10 Conversations
     * const conversations = await prisma.conversation.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const conversationWithIdOnly = await prisma.conversation.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ConversationFindManyArgs>(args?: SelectSubset<T, ConversationFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ConversationPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Conversation.
     * @param {ConversationCreateArgs} args - Arguments to create a Conversation.
     * @example
     * // Create one Conversation
     * const Conversation = await prisma.conversation.create({
     *   data: {
     *     // ... data to create a Conversation
     *   }
     * })
     * 
     */
    create<T extends ConversationCreateArgs>(args: SelectSubset<T, ConversationCreateArgs<ExtArgs>>): Prisma__ConversationClient<$Result.GetResult<Prisma.$ConversationPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Conversations.
     * @param {ConversationCreateManyArgs} args - Arguments to create many Conversations.
     * @example
     * // Create many Conversations
     * const conversation = await prisma.conversation.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ConversationCreateManyArgs>(args?: SelectSubset<T, ConversationCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Conversations and returns the data saved in the database.
     * @param {ConversationCreateManyAndReturnArgs} args - Arguments to create many Conversations.
     * @example
     * // Create many Conversations
     * const conversation = await prisma.conversation.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Conversations and only return the `id`
     * const conversationWithIdOnly = await prisma.conversation.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ConversationCreateManyAndReturnArgs>(args?: SelectSubset<T, ConversationCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ConversationPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Conversation.
     * @param {ConversationDeleteArgs} args - Arguments to delete one Conversation.
     * @example
     * // Delete one Conversation
     * const Conversation = await prisma.conversation.delete({
     *   where: {
     *     // ... filter to delete one Conversation
     *   }
     * })
     * 
     */
    delete<T extends ConversationDeleteArgs>(args: SelectSubset<T, ConversationDeleteArgs<ExtArgs>>): Prisma__ConversationClient<$Result.GetResult<Prisma.$ConversationPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Conversation.
     * @param {ConversationUpdateArgs} args - Arguments to update one Conversation.
     * @example
     * // Update one Conversation
     * const conversation = await prisma.conversation.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ConversationUpdateArgs>(args: SelectSubset<T, ConversationUpdateArgs<ExtArgs>>): Prisma__ConversationClient<$Result.GetResult<Prisma.$ConversationPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Conversations.
     * @param {ConversationDeleteManyArgs} args - Arguments to filter Conversations to delete.
     * @example
     * // Delete a few Conversations
     * const { count } = await prisma.conversation.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ConversationDeleteManyArgs>(args?: SelectSubset<T, ConversationDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Conversations.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConversationUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Conversations
     * const conversation = await prisma.conversation.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ConversationUpdateManyArgs>(args: SelectSubset<T, ConversationUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Conversation.
     * @param {ConversationUpsertArgs} args - Arguments to update or create a Conversation.
     * @example
     * // Update or create a Conversation
     * const conversation = await prisma.conversation.upsert({
     *   create: {
     *     // ... data to create a Conversation
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Conversation we want to update
     *   }
     * })
     */
    upsert<T extends ConversationUpsertArgs>(args: SelectSubset<T, ConversationUpsertArgs<ExtArgs>>): Prisma__ConversationClient<$Result.GetResult<Prisma.$ConversationPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Conversations.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConversationCountArgs} args - Arguments to filter Conversations to count.
     * @example
     * // Count the number of Conversations
     * const count = await prisma.conversation.count({
     *   where: {
     *     // ... the filter for the Conversations we want to count
     *   }
     * })
    **/
    count<T extends ConversationCountArgs>(
      args?: Subset<T, ConversationCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ConversationCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Conversation.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConversationAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ConversationAggregateArgs>(args: Subset<T, ConversationAggregateArgs>): Prisma.PrismaPromise<GetConversationAggregateType<T>>

    /**
     * Group by Conversation.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConversationGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ConversationGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ConversationGroupByArgs['orderBy'] }
        : { orderBy?: ConversationGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ConversationGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetConversationGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Conversation model
   */
  readonly fields: ConversationFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Conversation.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ConversationClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    contact<T extends ContactDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ContactDefaultArgs<ExtArgs>>): Prisma__ContactClient<$Result.GetResult<Prisma.$ContactPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    department<T extends Conversation$departmentArgs<ExtArgs> = {}>(args?: Subset<T, Conversation$departmentArgs<ExtArgs>>): Prisma__DepartmentClient<$Result.GetResult<Prisma.$DepartmentPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    assignedAgent<T extends Conversation$assignedAgentArgs<ExtArgs> = {}>(args?: Subset<T, Conversation$assignedAgentArgs<ExtArgs>>): Prisma__AgentClient<$Result.GetResult<Prisma.$AgentPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    messages<T extends Conversation$messagesArgs<ExtArgs> = {}>(args?: Subset<T, Conversation$messagesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MessagePayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Conversation model
   */ 
  interface ConversationFieldRefs {
    readonly id: FieldRef<"Conversation", 'String'>
    readonly contactId: FieldRef<"Conversation", 'String'>
    readonly status: FieldRef<"Conversation", 'String'>
    readonly departmentId: FieldRef<"Conversation", 'String'>
    readonly assignedAgentId: FieldRef<"Conversation", 'String'>
    readonly currentStep: FieldRef<"Conversation", 'String'>
    readonly startedAt: FieldRef<"Conversation", 'DateTime'>
    readonly closedAt: FieldRef<"Conversation", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Conversation findUnique
   */
  export type ConversationFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Conversation
     */
    select?: ConversationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConversationInclude<ExtArgs> | null
    /**
     * Filter, which Conversation to fetch.
     */
    where: ConversationWhereUniqueInput
  }

  /**
   * Conversation findUniqueOrThrow
   */
  export type ConversationFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Conversation
     */
    select?: ConversationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConversationInclude<ExtArgs> | null
    /**
     * Filter, which Conversation to fetch.
     */
    where: ConversationWhereUniqueInput
  }

  /**
   * Conversation findFirst
   */
  export type ConversationFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Conversation
     */
    select?: ConversationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConversationInclude<ExtArgs> | null
    /**
     * Filter, which Conversation to fetch.
     */
    where?: ConversationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Conversations to fetch.
     */
    orderBy?: ConversationOrderByWithRelationInput | ConversationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Conversations.
     */
    cursor?: ConversationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Conversations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Conversations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Conversations.
     */
    distinct?: ConversationScalarFieldEnum | ConversationScalarFieldEnum[]
  }

  /**
   * Conversation findFirstOrThrow
   */
  export type ConversationFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Conversation
     */
    select?: ConversationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConversationInclude<ExtArgs> | null
    /**
     * Filter, which Conversation to fetch.
     */
    where?: ConversationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Conversations to fetch.
     */
    orderBy?: ConversationOrderByWithRelationInput | ConversationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Conversations.
     */
    cursor?: ConversationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Conversations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Conversations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Conversations.
     */
    distinct?: ConversationScalarFieldEnum | ConversationScalarFieldEnum[]
  }

  /**
   * Conversation findMany
   */
  export type ConversationFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Conversation
     */
    select?: ConversationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConversationInclude<ExtArgs> | null
    /**
     * Filter, which Conversations to fetch.
     */
    where?: ConversationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Conversations to fetch.
     */
    orderBy?: ConversationOrderByWithRelationInput | ConversationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Conversations.
     */
    cursor?: ConversationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Conversations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Conversations.
     */
    skip?: number
    distinct?: ConversationScalarFieldEnum | ConversationScalarFieldEnum[]
  }

  /**
   * Conversation create
   */
  export type ConversationCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Conversation
     */
    select?: ConversationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConversationInclude<ExtArgs> | null
    /**
     * The data needed to create a Conversation.
     */
    data: XOR<ConversationCreateInput, ConversationUncheckedCreateInput>
  }

  /**
   * Conversation createMany
   */
  export type ConversationCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Conversations.
     */
    data: ConversationCreateManyInput | ConversationCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Conversation createManyAndReturn
   */
  export type ConversationCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Conversation
     */
    select?: ConversationSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Conversations.
     */
    data: ConversationCreateManyInput | ConversationCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConversationIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Conversation update
   */
  export type ConversationUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Conversation
     */
    select?: ConversationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConversationInclude<ExtArgs> | null
    /**
     * The data needed to update a Conversation.
     */
    data: XOR<ConversationUpdateInput, ConversationUncheckedUpdateInput>
    /**
     * Choose, which Conversation to update.
     */
    where: ConversationWhereUniqueInput
  }

  /**
   * Conversation updateMany
   */
  export type ConversationUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Conversations.
     */
    data: XOR<ConversationUpdateManyMutationInput, ConversationUncheckedUpdateManyInput>
    /**
     * Filter which Conversations to update
     */
    where?: ConversationWhereInput
  }

  /**
   * Conversation upsert
   */
  export type ConversationUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Conversation
     */
    select?: ConversationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConversationInclude<ExtArgs> | null
    /**
     * The filter to search for the Conversation to update in case it exists.
     */
    where: ConversationWhereUniqueInput
    /**
     * In case the Conversation found by the `where` argument doesn't exist, create a new Conversation with this data.
     */
    create: XOR<ConversationCreateInput, ConversationUncheckedCreateInput>
    /**
     * In case the Conversation was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ConversationUpdateInput, ConversationUncheckedUpdateInput>
  }

  /**
   * Conversation delete
   */
  export type ConversationDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Conversation
     */
    select?: ConversationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConversationInclude<ExtArgs> | null
    /**
     * Filter which Conversation to delete.
     */
    where: ConversationWhereUniqueInput
  }

  /**
   * Conversation deleteMany
   */
  export type ConversationDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Conversations to delete
     */
    where?: ConversationWhereInput
  }

  /**
   * Conversation.department
   */
  export type Conversation$departmentArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Department
     */
    select?: DepartmentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DepartmentInclude<ExtArgs> | null
    where?: DepartmentWhereInput
  }

  /**
   * Conversation.assignedAgent
   */
  export type Conversation$assignedAgentArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Agent
     */
    select?: AgentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgentInclude<ExtArgs> | null
    where?: AgentWhereInput
  }

  /**
   * Conversation.messages
   */
  export type Conversation$messagesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Message
     */
    select?: MessageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MessageInclude<ExtArgs> | null
    where?: MessageWhereInput
    orderBy?: MessageOrderByWithRelationInput | MessageOrderByWithRelationInput[]
    cursor?: MessageWhereUniqueInput
    take?: number
    skip?: number
    distinct?: MessageScalarFieldEnum | MessageScalarFieldEnum[]
  }

  /**
   * Conversation without action
   */
  export type ConversationDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Conversation
     */
    select?: ConversationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConversationInclude<ExtArgs> | null
  }


  /**
   * Model Message
   */

  export type AggregateMessage = {
    _count: MessageCountAggregateOutputType | null
    _min: MessageMinAggregateOutputType | null
    _max: MessageMaxAggregateOutputType | null
  }

  export type MessageMinAggregateOutputType = {
    id: string | null
    conversationId: string | null
    direction: string | null
    senderType: string | null
    senderAgentId: string | null
    content: string | null
    createdAt: Date | null
    readAt: Date | null
  }

  export type MessageMaxAggregateOutputType = {
    id: string | null
    conversationId: string | null
    direction: string | null
    senderType: string | null
    senderAgentId: string | null
    content: string | null
    createdAt: Date | null
    readAt: Date | null
  }

  export type MessageCountAggregateOutputType = {
    id: number
    conversationId: number
    direction: number
    senderType: number
    senderAgentId: number
    content: number
    createdAt: number
    readAt: number
    _all: number
  }


  export type MessageMinAggregateInputType = {
    id?: true
    conversationId?: true
    direction?: true
    senderType?: true
    senderAgentId?: true
    content?: true
    createdAt?: true
    readAt?: true
  }

  export type MessageMaxAggregateInputType = {
    id?: true
    conversationId?: true
    direction?: true
    senderType?: true
    senderAgentId?: true
    content?: true
    createdAt?: true
    readAt?: true
  }

  export type MessageCountAggregateInputType = {
    id?: true
    conversationId?: true
    direction?: true
    senderType?: true
    senderAgentId?: true
    content?: true
    createdAt?: true
    readAt?: true
    _all?: true
  }

  export type MessageAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Message to aggregate.
     */
    where?: MessageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Messages to fetch.
     */
    orderBy?: MessageOrderByWithRelationInput | MessageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: MessageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Messages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Messages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Messages
    **/
    _count?: true | MessageCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: MessageMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: MessageMaxAggregateInputType
  }

  export type GetMessageAggregateType<T extends MessageAggregateArgs> = {
        [P in keyof T & keyof AggregateMessage]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateMessage[P]>
      : GetScalarType<T[P], AggregateMessage[P]>
  }




  export type MessageGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MessageWhereInput
    orderBy?: MessageOrderByWithAggregationInput | MessageOrderByWithAggregationInput[]
    by: MessageScalarFieldEnum[] | MessageScalarFieldEnum
    having?: MessageScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: MessageCountAggregateInputType | true
    _min?: MessageMinAggregateInputType
    _max?: MessageMaxAggregateInputType
  }

  export type MessageGroupByOutputType = {
    id: string
    conversationId: string
    direction: string
    senderType: string
    senderAgentId: string | null
    content: string
    createdAt: Date
    readAt: Date | null
    _count: MessageCountAggregateOutputType | null
    _min: MessageMinAggregateOutputType | null
    _max: MessageMaxAggregateOutputType | null
  }

  type GetMessageGroupByPayload<T extends MessageGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<MessageGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof MessageGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], MessageGroupByOutputType[P]>
            : GetScalarType<T[P], MessageGroupByOutputType[P]>
        }
      >
    >


  export type MessageSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    conversationId?: boolean
    direction?: boolean
    senderType?: boolean
    senderAgentId?: boolean
    content?: boolean
    createdAt?: boolean
    readAt?: boolean
    conversation?: boolean | ConversationDefaultArgs<ExtArgs>
    senderAgent?: boolean | Message$senderAgentArgs<ExtArgs>
  }, ExtArgs["result"]["message"]>

  export type MessageSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    conversationId?: boolean
    direction?: boolean
    senderType?: boolean
    senderAgentId?: boolean
    content?: boolean
    createdAt?: boolean
    readAt?: boolean
    conversation?: boolean | ConversationDefaultArgs<ExtArgs>
    senderAgent?: boolean | Message$senderAgentArgs<ExtArgs>
  }, ExtArgs["result"]["message"]>

  export type MessageSelectScalar = {
    id?: boolean
    conversationId?: boolean
    direction?: boolean
    senderType?: boolean
    senderAgentId?: boolean
    content?: boolean
    createdAt?: boolean
    readAt?: boolean
  }

  export type MessageInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    conversation?: boolean | ConversationDefaultArgs<ExtArgs>
    senderAgent?: boolean | Message$senderAgentArgs<ExtArgs>
  }
  export type MessageIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    conversation?: boolean | ConversationDefaultArgs<ExtArgs>
    senderAgent?: boolean | Message$senderAgentArgs<ExtArgs>
  }

  export type $MessagePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Message"
    objects: {
      conversation: Prisma.$ConversationPayload<ExtArgs>
      senderAgent: Prisma.$AgentPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      conversationId: string
      direction: string
      senderType: string
      senderAgentId: string | null
      content: string
      createdAt: Date
      readAt: Date | null
    }, ExtArgs["result"]["message"]>
    composites: {}
  }

  type MessageGetPayload<S extends boolean | null | undefined | MessageDefaultArgs> = $Result.GetResult<Prisma.$MessagePayload, S>

  type MessageCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<MessageFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: MessageCountAggregateInputType | true
    }

  export interface MessageDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Message'], meta: { name: 'Message' } }
    /**
     * Find zero or one Message that matches the filter.
     * @param {MessageFindUniqueArgs} args - Arguments to find a Message
     * @example
     * // Get one Message
     * const message = await prisma.message.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends MessageFindUniqueArgs>(args: SelectSubset<T, MessageFindUniqueArgs<ExtArgs>>): Prisma__MessageClient<$Result.GetResult<Prisma.$MessagePayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Message that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {MessageFindUniqueOrThrowArgs} args - Arguments to find a Message
     * @example
     * // Get one Message
     * const message = await prisma.message.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends MessageFindUniqueOrThrowArgs>(args: SelectSubset<T, MessageFindUniqueOrThrowArgs<ExtArgs>>): Prisma__MessageClient<$Result.GetResult<Prisma.$MessagePayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Message that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MessageFindFirstArgs} args - Arguments to find a Message
     * @example
     * // Get one Message
     * const message = await prisma.message.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends MessageFindFirstArgs>(args?: SelectSubset<T, MessageFindFirstArgs<ExtArgs>>): Prisma__MessageClient<$Result.GetResult<Prisma.$MessagePayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Message that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MessageFindFirstOrThrowArgs} args - Arguments to find a Message
     * @example
     * // Get one Message
     * const message = await prisma.message.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends MessageFindFirstOrThrowArgs>(args?: SelectSubset<T, MessageFindFirstOrThrowArgs<ExtArgs>>): Prisma__MessageClient<$Result.GetResult<Prisma.$MessagePayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Messages that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MessageFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Messages
     * const messages = await prisma.message.findMany()
     * 
     * // Get first 10 Messages
     * const messages = await prisma.message.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const messageWithIdOnly = await prisma.message.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends MessageFindManyArgs>(args?: SelectSubset<T, MessageFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MessagePayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Message.
     * @param {MessageCreateArgs} args - Arguments to create a Message.
     * @example
     * // Create one Message
     * const Message = await prisma.message.create({
     *   data: {
     *     // ... data to create a Message
     *   }
     * })
     * 
     */
    create<T extends MessageCreateArgs>(args: SelectSubset<T, MessageCreateArgs<ExtArgs>>): Prisma__MessageClient<$Result.GetResult<Prisma.$MessagePayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Messages.
     * @param {MessageCreateManyArgs} args - Arguments to create many Messages.
     * @example
     * // Create many Messages
     * const message = await prisma.message.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends MessageCreateManyArgs>(args?: SelectSubset<T, MessageCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Messages and returns the data saved in the database.
     * @param {MessageCreateManyAndReturnArgs} args - Arguments to create many Messages.
     * @example
     * // Create many Messages
     * const message = await prisma.message.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Messages and only return the `id`
     * const messageWithIdOnly = await prisma.message.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends MessageCreateManyAndReturnArgs>(args?: SelectSubset<T, MessageCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MessagePayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Message.
     * @param {MessageDeleteArgs} args - Arguments to delete one Message.
     * @example
     * // Delete one Message
     * const Message = await prisma.message.delete({
     *   where: {
     *     // ... filter to delete one Message
     *   }
     * })
     * 
     */
    delete<T extends MessageDeleteArgs>(args: SelectSubset<T, MessageDeleteArgs<ExtArgs>>): Prisma__MessageClient<$Result.GetResult<Prisma.$MessagePayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Message.
     * @param {MessageUpdateArgs} args - Arguments to update one Message.
     * @example
     * // Update one Message
     * const message = await prisma.message.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends MessageUpdateArgs>(args: SelectSubset<T, MessageUpdateArgs<ExtArgs>>): Prisma__MessageClient<$Result.GetResult<Prisma.$MessagePayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Messages.
     * @param {MessageDeleteManyArgs} args - Arguments to filter Messages to delete.
     * @example
     * // Delete a few Messages
     * const { count } = await prisma.message.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends MessageDeleteManyArgs>(args?: SelectSubset<T, MessageDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Messages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MessageUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Messages
     * const message = await prisma.message.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends MessageUpdateManyArgs>(args: SelectSubset<T, MessageUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Message.
     * @param {MessageUpsertArgs} args - Arguments to update or create a Message.
     * @example
     * // Update or create a Message
     * const message = await prisma.message.upsert({
     *   create: {
     *     // ... data to create a Message
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Message we want to update
     *   }
     * })
     */
    upsert<T extends MessageUpsertArgs>(args: SelectSubset<T, MessageUpsertArgs<ExtArgs>>): Prisma__MessageClient<$Result.GetResult<Prisma.$MessagePayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Messages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MessageCountArgs} args - Arguments to filter Messages to count.
     * @example
     * // Count the number of Messages
     * const count = await prisma.message.count({
     *   where: {
     *     // ... the filter for the Messages we want to count
     *   }
     * })
    **/
    count<T extends MessageCountArgs>(
      args?: Subset<T, MessageCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], MessageCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Message.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MessageAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends MessageAggregateArgs>(args: Subset<T, MessageAggregateArgs>): Prisma.PrismaPromise<GetMessageAggregateType<T>>

    /**
     * Group by Message.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MessageGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends MessageGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: MessageGroupByArgs['orderBy'] }
        : { orderBy?: MessageGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, MessageGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetMessageGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Message model
   */
  readonly fields: MessageFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Message.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__MessageClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    conversation<T extends ConversationDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ConversationDefaultArgs<ExtArgs>>): Prisma__ConversationClient<$Result.GetResult<Prisma.$ConversationPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    senderAgent<T extends Message$senderAgentArgs<ExtArgs> = {}>(args?: Subset<T, Message$senderAgentArgs<ExtArgs>>): Prisma__AgentClient<$Result.GetResult<Prisma.$AgentPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Message model
   */ 
  interface MessageFieldRefs {
    readonly id: FieldRef<"Message", 'String'>
    readonly conversationId: FieldRef<"Message", 'String'>
    readonly direction: FieldRef<"Message", 'String'>
    readonly senderType: FieldRef<"Message", 'String'>
    readonly senderAgentId: FieldRef<"Message", 'String'>
    readonly content: FieldRef<"Message", 'String'>
    readonly createdAt: FieldRef<"Message", 'DateTime'>
    readonly readAt: FieldRef<"Message", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Message findUnique
   */
  export type MessageFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Message
     */
    select?: MessageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MessageInclude<ExtArgs> | null
    /**
     * Filter, which Message to fetch.
     */
    where: MessageWhereUniqueInput
  }

  /**
   * Message findUniqueOrThrow
   */
  export type MessageFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Message
     */
    select?: MessageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MessageInclude<ExtArgs> | null
    /**
     * Filter, which Message to fetch.
     */
    where: MessageWhereUniqueInput
  }

  /**
   * Message findFirst
   */
  export type MessageFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Message
     */
    select?: MessageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MessageInclude<ExtArgs> | null
    /**
     * Filter, which Message to fetch.
     */
    where?: MessageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Messages to fetch.
     */
    orderBy?: MessageOrderByWithRelationInput | MessageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Messages.
     */
    cursor?: MessageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Messages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Messages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Messages.
     */
    distinct?: MessageScalarFieldEnum | MessageScalarFieldEnum[]
  }

  /**
   * Message findFirstOrThrow
   */
  export type MessageFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Message
     */
    select?: MessageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MessageInclude<ExtArgs> | null
    /**
     * Filter, which Message to fetch.
     */
    where?: MessageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Messages to fetch.
     */
    orderBy?: MessageOrderByWithRelationInput | MessageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Messages.
     */
    cursor?: MessageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Messages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Messages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Messages.
     */
    distinct?: MessageScalarFieldEnum | MessageScalarFieldEnum[]
  }

  /**
   * Message findMany
   */
  export type MessageFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Message
     */
    select?: MessageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MessageInclude<ExtArgs> | null
    /**
     * Filter, which Messages to fetch.
     */
    where?: MessageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Messages to fetch.
     */
    orderBy?: MessageOrderByWithRelationInput | MessageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Messages.
     */
    cursor?: MessageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Messages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Messages.
     */
    skip?: number
    distinct?: MessageScalarFieldEnum | MessageScalarFieldEnum[]
  }

  /**
   * Message create
   */
  export type MessageCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Message
     */
    select?: MessageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MessageInclude<ExtArgs> | null
    /**
     * The data needed to create a Message.
     */
    data: XOR<MessageCreateInput, MessageUncheckedCreateInput>
  }

  /**
   * Message createMany
   */
  export type MessageCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Messages.
     */
    data: MessageCreateManyInput | MessageCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Message createManyAndReturn
   */
  export type MessageCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Message
     */
    select?: MessageSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Messages.
     */
    data: MessageCreateManyInput | MessageCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MessageIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Message update
   */
  export type MessageUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Message
     */
    select?: MessageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MessageInclude<ExtArgs> | null
    /**
     * The data needed to update a Message.
     */
    data: XOR<MessageUpdateInput, MessageUncheckedUpdateInput>
    /**
     * Choose, which Message to update.
     */
    where: MessageWhereUniqueInput
  }

  /**
   * Message updateMany
   */
  export type MessageUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Messages.
     */
    data: XOR<MessageUpdateManyMutationInput, MessageUncheckedUpdateManyInput>
    /**
     * Filter which Messages to update
     */
    where?: MessageWhereInput
  }

  /**
   * Message upsert
   */
  export type MessageUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Message
     */
    select?: MessageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MessageInclude<ExtArgs> | null
    /**
     * The filter to search for the Message to update in case it exists.
     */
    where: MessageWhereUniqueInput
    /**
     * In case the Message found by the `where` argument doesn't exist, create a new Message with this data.
     */
    create: XOR<MessageCreateInput, MessageUncheckedCreateInput>
    /**
     * In case the Message was found with the provided `where` argument, update it with this data.
     */
    update: XOR<MessageUpdateInput, MessageUncheckedUpdateInput>
  }

  /**
   * Message delete
   */
  export type MessageDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Message
     */
    select?: MessageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MessageInclude<ExtArgs> | null
    /**
     * Filter which Message to delete.
     */
    where: MessageWhereUniqueInput
  }

  /**
   * Message deleteMany
   */
  export type MessageDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Messages to delete
     */
    where?: MessageWhereInput
  }

  /**
   * Message.senderAgent
   */
  export type Message$senderAgentArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Agent
     */
    select?: AgentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgentInclude<ExtArgs> | null
    where?: AgentWhereInput
  }

  /**
   * Message without action
   */
  export type MessageDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Message
     */
    select?: MessageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MessageInclude<ExtArgs> | null
  }


  /**
   * Model FlowDefinition
   */

  export type AggregateFlowDefinition = {
    _count: FlowDefinitionCountAggregateOutputType | null
    _min: FlowDefinitionMinAggregateOutputType | null
    _max: FlowDefinitionMaxAggregateOutputType | null
  }

  export type FlowDefinitionMinAggregateOutputType = {
    id: string | null
    name: string | null
    greeting: string | null
    menuMessage: string | null
    updatedAt: Date | null
  }

  export type FlowDefinitionMaxAggregateOutputType = {
    id: string | null
    name: string | null
    greeting: string | null
    menuMessage: string | null
    updatedAt: Date | null
  }

  export type FlowDefinitionCountAggregateOutputType = {
    id: number
    name: number
    greeting: number
    menuMessage: number
    options: number
    updatedAt: number
    _all: number
  }


  export type FlowDefinitionMinAggregateInputType = {
    id?: true
    name?: true
    greeting?: true
    menuMessage?: true
    updatedAt?: true
  }

  export type FlowDefinitionMaxAggregateInputType = {
    id?: true
    name?: true
    greeting?: true
    menuMessage?: true
    updatedAt?: true
  }

  export type FlowDefinitionCountAggregateInputType = {
    id?: true
    name?: true
    greeting?: true
    menuMessage?: true
    options?: true
    updatedAt?: true
    _all?: true
  }

  export type FlowDefinitionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which FlowDefinition to aggregate.
     */
    where?: FlowDefinitionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FlowDefinitions to fetch.
     */
    orderBy?: FlowDefinitionOrderByWithRelationInput | FlowDefinitionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: FlowDefinitionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FlowDefinitions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FlowDefinitions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned FlowDefinitions
    **/
    _count?: true | FlowDefinitionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: FlowDefinitionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: FlowDefinitionMaxAggregateInputType
  }

  export type GetFlowDefinitionAggregateType<T extends FlowDefinitionAggregateArgs> = {
        [P in keyof T & keyof AggregateFlowDefinition]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateFlowDefinition[P]>
      : GetScalarType<T[P], AggregateFlowDefinition[P]>
  }




  export type FlowDefinitionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: FlowDefinitionWhereInput
    orderBy?: FlowDefinitionOrderByWithAggregationInput | FlowDefinitionOrderByWithAggregationInput[]
    by: FlowDefinitionScalarFieldEnum[] | FlowDefinitionScalarFieldEnum
    having?: FlowDefinitionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: FlowDefinitionCountAggregateInputType | true
    _min?: FlowDefinitionMinAggregateInputType
    _max?: FlowDefinitionMaxAggregateInputType
  }

  export type FlowDefinitionGroupByOutputType = {
    id: string
    name: string
    greeting: string
    menuMessage: string
    options: JsonValue
    updatedAt: Date
    _count: FlowDefinitionCountAggregateOutputType | null
    _min: FlowDefinitionMinAggregateOutputType | null
    _max: FlowDefinitionMaxAggregateOutputType | null
  }

  type GetFlowDefinitionGroupByPayload<T extends FlowDefinitionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<FlowDefinitionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof FlowDefinitionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], FlowDefinitionGroupByOutputType[P]>
            : GetScalarType<T[P], FlowDefinitionGroupByOutputType[P]>
        }
      >
    >


  export type FlowDefinitionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    greeting?: boolean
    menuMessage?: boolean
    options?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["flowDefinition"]>

  export type FlowDefinitionSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    greeting?: boolean
    menuMessage?: boolean
    options?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["flowDefinition"]>

  export type FlowDefinitionSelectScalar = {
    id?: boolean
    name?: boolean
    greeting?: boolean
    menuMessage?: boolean
    options?: boolean
    updatedAt?: boolean
  }


  export type $FlowDefinitionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "FlowDefinition"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      greeting: string
      menuMessage: string
      options: Prisma.JsonValue
      updatedAt: Date
    }, ExtArgs["result"]["flowDefinition"]>
    composites: {}
  }

  type FlowDefinitionGetPayload<S extends boolean | null | undefined | FlowDefinitionDefaultArgs> = $Result.GetResult<Prisma.$FlowDefinitionPayload, S>

  type FlowDefinitionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<FlowDefinitionFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: FlowDefinitionCountAggregateInputType | true
    }

  export interface FlowDefinitionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['FlowDefinition'], meta: { name: 'FlowDefinition' } }
    /**
     * Find zero or one FlowDefinition that matches the filter.
     * @param {FlowDefinitionFindUniqueArgs} args - Arguments to find a FlowDefinition
     * @example
     * // Get one FlowDefinition
     * const flowDefinition = await prisma.flowDefinition.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends FlowDefinitionFindUniqueArgs>(args: SelectSubset<T, FlowDefinitionFindUniqueArgs<ExtArgs>>): Prisma__FlowDefinitionClient<$Result.GetResult<Prisma.$FlowDefinitionPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one FlowDefinition that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {FlowDefinitionFindUniqueOrThrowArgs} args - Arguments to find a FlowDefinition
     * @example
     * // Get one FlowDefinition
     * const flowDefinition = await prisma.flowDefinition.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends FlowDefinitionFindUniqueOrThrowArgs>(args: SelectSubset<T, FlowDefinitionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__FlowDefinitionClient<$Result.GetResult<Prisma.$FlowDefinitionPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first FlowDefinition that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FlowDefinitionFindFirstArgs} args - Arguments to find a FlowDefinition
     * @example
     * // Get one FlowDefinition
     * const flowDefinition = await prisma.flowDefinition.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends FlowDefinitionFindFirstArgs>(args?: SelectSubset<T, FlowDefinitionFindFirstArgs<ExtArgs>>): Prisma__FlowDefinitionClient<$Result.GetResult<Prisma.$FlowDefinitionPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first FlowDefinition that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FlowDefinitionFindFirstOrThrowArgs} args - Arguments to find a FlowDefinition
     * @example
     * // Get one FlowDefinition
     * const flowDefinition = await prisma.flowDefinition.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends FlowDefinitionFindFirstOrThrowArgs>(args?: SelectSubset<T, FlowDefinitionFindFirstOrThrowArgs<ExtArgs>>): Prisma__FlowDefinitionClient<$Result.GetResult<Prisma.$FlowDefinitionPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more FlowDefinitions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FlowDefinitionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all FlowDefinitions
     * const flowDefinitions = await prisma.flowDefinition.findMany()
     * 
     * // Get first 10 FlowDefinitions
     * const flowDefinitions = await prisma.flowDefinition.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const flowDefinitionWithIdOnly = await prisma.flowDefinition.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends FlowDefinitionFindManyArgs>(args?: SelectSubset<T, FlowDefinitionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FlowDefinitionPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a FlowDefinition.
     * @param {FlowDefinitionCreateArgs} args - Arguments to create a FlowDefinition.
     * @example
     * // Create one FlowDefinition
     * const FlowDefinition = await prisma.flowDefinition.create({
     *   data: {
     *     // ... data to create a FlowDefinition
     *   }
     * })
     * 
     */
    create<T extends FlowDefinitionCreateArgs>(args: SelectSubset<T, FlowDefinitionCreateArgs<ExtArgs>>): Prisma__FlowDefinitionClient<$Result.GetResult<Prisma.$FlowDefinitionPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many FlowDefinitions.
     * @param {FlowDefinitionCreateManyArgs} args - Arguments to create many FlowDefinitions.
     * @example
     * // Create many FlowDefinitions
     * const flowDefinition = await prisma.flowDefinition.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends FlowDefinitionCreateManyArgs>(args?: SelectSubset<T, FlowDefinitionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many FlowDefinitions and returns the data saved in the database.
     * @param {FlowDefinitionCreateManyAndReturnArgs} args - Arguments to create many FlowDefinitions.
     * @example
     * // Create many FlowDefinitions
     * const flowDefinition = await prisma.flowDefinition.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many FlowDefinitions and only return the `id`
     * const flowDefinitionWithIdOnly = await prisma.flowDefinition.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends FlowDefinitionCreateManyAndReturnArgs>(args?: SelectSubset<T, FlowDefinitionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FlowDefinitionPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a FlowDefinition.
     * @param {FlowDefinitionDeleteArgs} args - Arguments to delete one FlowDefinition.
     * @example
     * // Delete one FlowDefinition
     * const FlowDefinition = await prisma.flowDefinition.delete({
     *   where: {
     *     // ... filter to delete one FlowDefinition
     *   }
     * })
     * 
     */
    delete<T extends FlowDefinitionDeleteArgs>(args: SelectSubset<T, FlowDefinitionDeleteArgs<ExtArgs>>): Prisma__FlowDefinitionClient<$Result.GetResult<Prisma.$FlowDefinitionPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one FlowDefinition.
     * @param {FlowDefinitionUpdateArgs} args - Arguments to update one FlowDefinition.
     * @example
     * // Update one FlowDefinition
     * const flowDefinition = await prisma.flowDefinition.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends FlowDefinitionUpdateArgs>(args: SelectSubset<T, FlowDefinitionUpdateArgs<ExtArgs>>): Prisma__FlowDefinitionClient<$Result.GetResult<Prisma.$FlowDefinitionPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more FlowDefinitions.
     * @param {FlowDefinitionDeleteManyArgs} args - Arguments to filter FlowDefinitions to delete.
     * @example
     * // Delete a few FlowDefinitions
     * const { count } = await prisma.flowDefinition.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends FlowDefinitionDeleteManyArgs>(args?: SelectSubset<T, FlowDefinitionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more FlowDefinitions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FlowDefinitionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many FlowDefinitions
     * const flowDefinition = await prisma.flowDefinition.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends FlowDefinitionUpdateManyArgs>(args: SelectSubset<T, FlowDefinitionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one FlowDefinition.
     * @param {FlowDefinitionUpsertArgs} args - Arguments to update or create a FlowDefinition.
     * @example
     * // Update or create a FlowDefinition
     * const flowDefinition = await prisma.flowDefinition.upsert({
     *   create: {
     *     // ... data to create a FlowDefinition
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the FlowDefinition we want to update
     *   }
     * })
     */
    upsert<T extends FlowDefinitionUpsertArgs>(args: SelectSubset<T, FlowDefinitionUpsertArgs<ExtArgs>>): Prisma__FlowDefinitionClient<$Result.GetResult<Prisma.$FlowDefinitionPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of FlowDefinitions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FlowDefinitionCountArgs} args - Arguments to filter FlowDefinitions to count.
     * @example
     * // Count the number of FlowDefinitions
     * const count = await prisma.flowDefinition.count({
     *   where: {
     *     // ... the filter for the FlowDefinitions we want to count
     *   }
     * })
    **/
    count<T extends FlowDefinitionCountArgs>(
      args?: Subset<T, FlowDefinitionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], FlowDefinitionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a FlowDefinition.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FlowDefinitionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends FlowDefinitionAggregateArgs>(args: Subset<T, FlowDefinitionAggregateArgs>): Prisma.PrismaPromise<GetFlowDefinitionAggregateType<T>>

    /**
     * Group by FlowDefinition.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FlowDefinitionGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends FlowDefinitionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: FlowDefinitionGroupByArgs['orderBy'] }
        : { orderBy?: FlowDefinitionGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, FlowDefinitionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetFlowDefinitionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the FlowDefinition model
   */
  readonly fields: FlowDefinitionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for FlowDefinition.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__FlowDefinitionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the FlowDefinition model
   */ 
  interface FlowDefinitionFieldRefs {
    readonly id: FieldRef<"FlowDefinition", 'String'>
    readonly name: FieldRef<"FlowDefinition", 'String'>
    readonly greeting: FieldRef<"FlowDefinition", 'String'>
    readonly menuMessage: FieldRef<"FlowDefinition", 'String'>
    readonly options: FieldRef<"FlowDefinition", 'Json'>
    readonly updatedAt: FieldRef<"FlowDefinition", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * FlowDefinition findUnique
   */
  export type FlowDefinitionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FlowDefinition
     */
    select?: FlowDefinitionSelect<ExtArgs> | null
    /**
     * Filter, which FlowDefinition to fetch.
     */
    where: FlowDefinitionWhereUniqueInput
  }

  /**
   * FlowDefinition findUniqueOrThrow
   */
  export type FlowDefinitionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FlowDefinition
     */
    select?: FlowDefinitionSelect<ExtArgs> | null
    /**
     * Filter, which FlowDefinition to fetch.
     */
    where: FlowDefinitionWhereUniqueInput
  }

  /**
   * FlowDefinition findFirst
   */
  export type FlowDefinitionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FlowDefinition
     */
    select?: FlowDefinitionSelect<ExtArgs> | null
    /**
     * Filter, which FlowDefinition to fetch.
     */
    where?: FlowDefinitionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FlowDefinitions to fetch.
     */
    orderBy?: FlowDefinitionOrderByWithRelationInput | FlowDefinitionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for FlowDefinitions.
     */
    cursor?: FlowDefinitionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FlowDefinitions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FlowDefinitions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of FlowDefinitions.
     */
    distinct?: FlowDefinitionScalarFieldEnum | FlowDefinitionScalarFieldEnum[]
  }

  /**
   * FlowDefinition findFirstOrThrow
   */
  export type FlowDefinitionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FlowDefinition
     */
    select?: FlowDefinitionSelect<ExtArgs> | null
    /**
     * Filter, which FlowDefinition to fetch.
     */
    where?: FlowDefinitionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FlowDefinitions to fetch.
     */
    orderBy?: FlowDefinitionOrderByWithRelationInput | FlowDefinitionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for FlowDefinitions.
     */
    cursor?: FlowDefinitionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FlowDefinitions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FlowDefinitions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of FlowDefinitions.
     */
    distinct?: FlowDefinitionScalarFieldEnum | FlowDefinitionScalarFieldEnum[]
  }

  /**
   * FlowDefinition findMany
   */
  export type FlowDefinitionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FlowDefinition
     */
    select?: FlowDefinitionSelect<ExtArgs> | null
    /**
     * Filter, which FlowDefinitions to fetch.
     */
    where?: FlowDefinitionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FlowDefinitions to fetch.
     */
    orderBy?: FlowDefinitionOrderByWithRelationInput | FlowDefinitionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing FlowDefinitions.
     */
    cursor?: FlowDefinitionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FlowDefinitions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FlowDefinitions.
     */
    skip?: number
    distinct?: FlowDefinitionScalarFieldEnum | FlowDefinitionScalarFieldEnum[]
  }

  /**
   * FlowDefinition create
   */
  export type FlowDefinitionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FlowDefinition
     */
    select?: FlowDefinitionSelect<ExtArgs> | null
    /**
     * The data needed to create a FlowDefinition.
     */
    data: XOR<FlowDefinitionCreateInput, FlowDefinitionUncheckedCreateInput>
  }

  /**
   * FlowDefinition createMany
   */
  export type FlowDefinitionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many FlowDefinitions.
     */
    data: FlowDefinitionCreateManyInput | FlowDefinitionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * FlowDefinition createManyAndReturn
   */
  export type FlowDefinitionCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FlowDefinition
     */
    select?: FlowDefinitionSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many FlowDefinitions.
     */
    data: FlowDefinitionCreateManyInput | FlowDefinitionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * FlowDefinition update
   */
  export type FlowDefinitionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FlowDefinition
     */
    select?: FlowDefinitionSelect<ExtArgs> | null
    /**
     * The data needed to update a FlowDefinition.
     */
    data: XOR<FlowDefinitionUpdateInput, FlowDefinitionUncheckedUpdateInput>
    /**
     * Choose, which FlowDefinition to update.
     */
    where: FlowDefinitionWhereUniqueInput
  }

  /**
   * FlowDefinition updateMany
   */
  export type FlowDefinitionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update FlowDefinitions.
     */
    data: XOR<FlowDefinitionUpdateManyMutationInput, FlowDefinitionUncheckedUpdateManyInput>
    /**
     * Filter which FlowDefinitions to update
     */
    where?: FlowDefinitionWhereInput
  }

  /**
   * FlowDefinition upsert
   */
  export type FlowDefinitionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FlowDefinition
     */
    select?: FlowDefinitionSelect<ExtArgs> | null
    /**
     * The filter to search for the FlowDefinition to update in case it exists.
     */
    where: FlowDefinitionWhereUniqueInput
    /**
     * In case the FlowDefinition found by the `where` argument doesn't exist, create a new FlowDefinition with this data.
     */
    create: XOR<FlowDefinitionCreateInput, FlowDefinitionUncheckedCreateInput>
    /**
     * In case the FlowDefinition was found with the provided `where` argument, update it with this data.
     */
    update: XOR<FlowDefinitionUpdateInput, FlowDefinitionUncheckedUpdateInput>
  }

  /**
   * FlowDefinition delete
   */
  export type FlowDefinitionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FlowDefinition
     */
    select?: FlowDefinitionSelect<ExtArgs> | null
    /**
     * Filter which FlowDefinition to delete.
     */
    where: FlowDefinitionWhereUniqueInput
  }

  /**
   * FlowDefinition deleteMany
   */
  export type FlowDefinitionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which FlowDefinitions to delete
     */
    where?: FlowDefinitionWhereInput
  }

  /**
   * FlowDefinition without action
   */
  export type FlowDefinitionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FlowDefinition
     */
    select?: FlowDefinitionSelect<ExtArgs> | null
  }


  /**
   * Model ZApiConfig
   */

  export type AggregateZApiConfig = {
    _count: ZApiConfigCountAggregateOutputType | null
    _min: ZApiConfigMinAggregateOutputType | null
    _max: ZApiConfigMaxAggregateOutputType | null
  }

  export type ZApiConfigMinAggregateOutputType = {
    id: string | null
    instanceId: string | null
    token: string | null
    clientToken: string | null
    webhookUrl: string | null
    isActive: boolean | null
    autoReply: boolean | null
    updatedAt: Date | null
  }

  export type ZApiConfigMaxAggregateOutputType = {
    id: string | null
    instanceId: string | null
    token: string | null
    clientToken: string | null
    webhookUrl: string | null
    isActive: boolean | null
    autoReply: boolean | null
    updatedAt: Date | null
  }

  export type ZApiConfigCountAggregateOutputType = {
    id: number
    instanceId: number
    token: number
    clientToken: number
    webhookUrl: number
    isActive: number
    autoReply: number
    updatedAt: number
    _all: number
  }


  export type ZApiConfigMinAggregateInputType = {
    id?: true
    instanceId?: true
    token?: true
    clientToken?: true
    webhookUrl?: true
    isActive?: true
    autoReply?: true
    updatedAt?: true
  }

  export type ZApiConfigMaxAggregateInputType = {
    id?: true
    instanceId?: true
    token?: true
    clientToken?: true
    webhookUrl?: true
    isActive?: true
    autoReply?: true
    updatedAt?: true
  }

  export type ZApiConfigCountAggregateInputType = {
    id?: true
    instanceId?: true
    token?: true
    clientToken?: true
    webhookUrl?: true
    isActive?: true
    autoReply?: true
    updatedAt?: true
    _all?: true
  }

  export type ZApiConfigAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ZApiConfig to aggregate.
     */
    where?: ZApiConfigWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ZApiConfigs to fetch.
     */
    orderBy?: ZApiConfigOrderByWithRelationInput | ZApiConfigOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ZApiConfigWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ZApiConfigs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ZApiConfigs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ZApiConfigs
    **/
    _count?: true | ZApiConfigCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ZApiConfigMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ZApiConfigMaxAggregateInputType
  }

  export type GetZApiConfigAggregateType<T extends ZApiConfigAggregateArgs> = {
        [P in keyof T & keyof AggregateZApiConfig]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateZApiConfig[P]>
      : GetScalarType<T[P], AggregateZApiConfig[P]>
  }




  export type ZApiConfigGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ZApiConfigWhereInput
    orderBy?: ZApiConfigOrderByWithAggregationInput | ZApiConfigOrderByWithAggregationInput[]
    by: ZApiConfigScalarFieldEnum[] | ZApiConfigScalarFieldEnum
    having?: ZApiConfigScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ZApiConfigCountAggregateInputType | true
    _min?: ZApiConfigMinAggregateInputType
    _max?: ZApiConfigMaxAggregateInputType
  }

  export type ZApiConfigGroupByOutputType = {
    id: string
    instanceId: string
    token: string
    clientToken: string | null
    webhookUrl: string | null
    isActive: boolean
    autoReply: boolean
    updatedAt: Date
    _count: ZApiConfigCountAggregateOutputType | null
    _min: ZApiConfigMinAggregateOutputType | null
    _max: ZApiConfigMaxAggregateOutputType | null
  }

  type GetZApiConfigGroupByPayload<T extends ZApiConfigGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ZApiConfigGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ZApiConfigGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ZApiConfigGroupByOutputType[P]>
            : GetScalarType<T[P], ZApiConfigGroupByOutputType[P]>
        }
      >
    >


  export type ZApiConfigSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    instanceId?: boolean
    token?: boolean
    clientToken?: boolean
    webhookUrl?: boolean
    isActive?: boolean
    autoReply?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["zApiConfig"]>

  export type ZApiConfigSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    instanceId?: boolean
    token?: boolean
    clientToken?: boolean
    webhookUrl?: boolean
    isActive?: boolean
    autoReply?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["zApiConfig"]>

  export type ZApiConfigSelectScalar = {
    id?: boolean
    instanceId?: boolean
    token?: boolean
    clientToken?: boolean
    webhookUrl?: boolean
    isActive?: boolean
    autoReply?: boolean
    updatedAt?: boolean
  }


  export type $ZApiConfigPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ZApiConfig"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      instanceId: string
      token: string
      clientToken: string | null
      webhookUrl: string | null
      isActive: boolean
      autoReply: boolean
      updatedAt: Date
    }, ExtArgs["result"]["zApiConfig"]>
    composites: {}
  }

  type ZApiConfigGetPayload<S extends boolean | null | undefined | ZApiConfigDefaultArgs> = $Result.GetResult<Prisma.$ZApiConfigPayload, S>

  type ZApiConfigCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<ZApiConfigFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: ZApiConfigCountAggregateInputType | true
    }

  export interface ZApiConfigDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ZApiConfig'], meta: { name: 'ZApiConfig' } }
    /**
     * Find zero or one ZApiConfig that matches the filter.
     * @param {ZApiConfigFindUniqueArgs} args - Arguments to find a ZApiConfig
     * @example
     * // Get one ZApiConfig
     * const zApiConfig = await prisma.zApiConfig.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ZApiConfigFindUniqueArgs>(args: SelectSubset<T, ZApiConfigFindUniqueArgs<ExtArgs>>): Prisma__ZApiConfigClient<$Result.GetResult<Prisma.$ZApiConfigPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one ZApiConfig that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {ZApiConfigFindUniqueOrThrowArgs} args - Arguments to find a ZApiConfig
     * @example
     * // Get one ZApiConfig
     * const zApiConfig = await prisma.zApiConfig.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ZApiConfigFindUniqueOrThrowArgs>(args: SelectSubset<T, ZApiConfigFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ZApiConfigClient<$Result.GetResult<Prisma.$ZApiConfigPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first ZApiConfig that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ZApiConfigFindFirstArgs} args - Arguments to find a ZApiConfig
     * @example
     * // Get one ZApiConfig
     * const zApiConfig = await prisma.zApiConfig.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ZApiConfigFindFirstArgs>(args?: SelectSubset<T, ZApiConfigFindFirstArgs<ExtArgs>>): Prisma__ZApiConfigClient<$Result.GetResult<Prisma.$ZApiConfigPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first ZApiConfig that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ZApiConfigFindFirstOrThrowArgs} args - Arguments to find a ZApiConfig
     * @example
     * // Get one ZApiConfig
     * const zApiConfig = await prisma.zApiConfig.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ZApiConfigFindFirstOrThrowArgs>(args?: SelectSubset<T, ZApiConfigFindFirstOrThrowArgs<ExtArgs>>): Prisma__ZApiConfigClient<$Result.GetResult<Prisma.$ZApiConfigPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more ZApiConfigs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ZApiConfigFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ZApiConfigs
     * const zApiConfigs = await prisma.zApiConfig.findMany()
     * 
     * // Get first 10 ZApiConfigs
     * const zApiConfigs = await prisma.zApiConfig.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const zApiConfigWithIdOnly = await prisma.zApiConfig.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ZApiConfigFindManyArgs>(args?: SelectSubset<T, ZApiConfigFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ZApiConfigPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a ZApiConfig.
     * @param {ZApiConfigCreateArgs} args - Arguments to create a ZApiConfig.
     * @example
     * // Create one ZApiConfig
     * const ZApiConfig = await prisma.zApiConfig.create({
     *   data: {
     *     // ... data to create a ZApiConfig
     *   }
     * })
     * 
     */
    create<T extends ZApiConfigCreateArgs>(args: SelectSubset<T, ZApiConfigCreateArgs<ExtArgs>>): Prisma__ZApiConfigClient<$Result.GetResult<Prisma.$ZApiConfigPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many ZApiConfigs.
     * @param {ZApiConfigCreateManyArgs} args - Arguments to create many ZApiConfigs.
     * @example
     * // Create many ZApiConfigs
     * const zApiConfig = await prisma.zApiConfig.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ZApiConfigCreateManyArgs>(args?: SelectSubset<T, ZApiConfigCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ZApiConfigs and returns the data saved in the database.
     * @param {ZApiConfigCreateManyAndReturnArgs} args - Arguments to create many ZApiConfigs.
     * @example
     * // Create many ZApiConfigs
     * const zApiConfig = await prisma.zApiConfig.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ZApiConfigs and only return the `id`
     * const zApiConfigWithIdOnly = await prisma.zApiConfig.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ZApiConfigCreateManyAndReturnArgs>(args?: SelectSubset<T, ZApiConfigCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ZApiConfigPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a ZApiConfig.
     * @param {ZApiConfigDeleteArgs} args - Arguments to delete one ZApiConfig.
     * @example
     * // Delete one ZApiConfig
     * const ZApiConfig = await prisma.zApiConfig.delete({
     *   where: {
     *     // ... filter to delete one ZApiConfig
     *   }
     * })
     * 
     */
    delete<T extends ZApiConfigDeleteArgs>(args: SelectSubset<T, ZApiConfigDeleteArgs<ExtArgs>>): Prisma__ZApiConfigClient<$Result.GetResult<Prisma.$ZApiConfigPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one ZApiConfig.
     * @param {ZApiConfigUpdateArgs} args - Arguments to update one ZApiConfig.
     * @example
     * // Update one ZApiConfig
     * const zApiConfig = await prisma.zApiConfig.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ZApiConfigUpdateArgs>(args: SelectSubset<T, ZApiConfigUpdateArgs<ExtArgs>>): Prisma__ZApiConfigClient<$Result.GetResult<Prisma.$ZApiConfigPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more ZApiConfigs.
     * @param {ZApiConfigDeleteManyArgs} args - Arguments to filter ZApiConfigs to delete.
     * @example
     * // Delete a few ZApiConfigs
     * const { count } = await prisma.zApiConfig.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ZApiConfigDeleteManyArgs>(args?: SelectSubset<T, ZApiConfigDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ZApiConfigs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ZApiConfigUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ZApiConfigs
     * const zApiConfig = await prisma.zApiConfig.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ZApiConfigUpdateManyArgs>(args: SelectSubset<T, ZApiConfigUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one ZApiConfig.
     * @param {ZApiConfigUpsertArgs} args - Arguments to update or create a ZApiConfig.
     * @example
     * // Update or create a ZApiConfig
     * const zApiConfig = await prisma.zApiConfig.upsert({
     *   create: {
     *     // ... data to create a ZApiConfig
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ZApiConfig we want to update
     *   }
     * })
     */
    upsert<T extends ZApiConfigUpsertArgs>(args: SelectSubset<T, ZApiConfigUpsertArgs<ExtArgs>>): Prisma__ZApiConfigClient<$Result.GetResult<Prisma.$ZApiConfigPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of ZApiConfigs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ZApiConfigCountArgs} args - Arguments to filter ZApiConfigs to count.
     * @example
     * // Count the number of ZApiConfigs
     * const count = await prisma.zApiConfig.count({
     *   where: {
     *     // ... the filter for the ZApiConfigs we want to count
     *   }
     * })
    **/
    count<T extends ZApiConfigCountArgs>(
      args?: Subset<T, ZApiConfigCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ZApiConfigCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ZApiConfig.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ZApiConfigAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ZApiConfigAggregateArgs>(args: Subset<T, ZApiConfigAggregateArgs>): Prisma.PrismaPromise<GetZApiConfigAggregateType<T>>

    /**
     * Group by ZApiConfig.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ZApiConfigGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ZApiConfigGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ZApiConfigGroupByArgs['orderBy'] }
        : { orderBy?: ZApiConfigGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ZApiConfigGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetZApiConfigGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ZApiConfig model
   */
  readonly fields: ZApiConfigFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ZApiConfig.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ZApiConfigClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the ZApiConfig model
   */ 
  interface ZApiConfigFieldRefs {
    readonly id: FieldRef<"ZApiConfig", 'String'>
    readonly instanceId: FieldRef<"ZApiConfig", 'String'>
    readonly token: FieldRef<"ZApiConfig", 'String'>
    readonly clientToken: FieldRef<"ZApiConfig", 'String'>
    readonly webhookUrl: FieldRef<"ZApiConfig", 'String'>
    readonly isActive: FieldRef<"ZApiConfig", 'Boolean'>
    readonly autoReply: FieldRef<"ZApiConfig", 'Boolean'>
    readonly updatedAt: FieldRef<"ZApiConfig", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ZApiConfig findUnique
   */
  export type ZApiConfigFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ZApiConfig
     */
    select?: ZApiConfigSelect<ExtArgs> | null
    /**
     * Filter, which ZApiConfig to fetch.
     */
    where: ZApiConfigWhereUniqueInput
  }

  /**
   * ZApiConfig findUniqueOrThrow
   */
  export type ZApiConfigFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ZApiConfig
     */
    select?: ZApiConfigSelect<ExtArgs> | null
    /**
     * Filter, which ZApiConfig to fetch.
     */
    where: ZApiConfigWhereUniqueInput
  }

  /**
   * ZApiConfig findFirst
   */
  export type ZApiConfigFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ZApiConfig
     */
    select?: ZApiConfigSelect<ExtArgs> | null
    /**
     * Filter, which ZApiConfig to fetch.
     */
    where?: ZApiConfigWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ZApiConfigs to fetch.
     */
    orderBy?: ZApiConfigOrderByWithRelationInput | ZApiConfigOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ZApiConfigs.
     */
    cursor?: ZApiConfigWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ZApiConfigs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ZApiConfigs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ZApiConfigs.
     */
    distinct?: ZApiConfigScalarFieldEnum | ZApiConfigScalarFieldEnum[]
  }

  /**
   * ZApiConfig findFirstOrThrow
   */
  export type ZApiConfigFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ZApiConfig
     */
    select?: ZApiConfigSelect<ExtArgs> | null
    /**
     * Filter, which ZApiConfig to fetch.
     */
    where?: ZApiConfigWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ZApiConfigs to fetch.
     */
    orderBy?: ZApiConfigOrderByWithRelationInput | ZApiConfigOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ZApiConfigs.
     */
    cursor?: ZApiConfigWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ZApiConfigs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ZApiConfigs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ZApiConfigs.
     */
    distinct?: ZApiConfigScalarFieldEnum | ZApiConfigScalarFieldEnum[]
  }

  /**
   * ZApiConfig findMany
   */
  export type ZApiConfigFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ZApiConfig
     */
    select?: ZApiConfigSelect<ExtArgs> | null
    /**
     * Filter, which ZApiConfigs to fetch.
     */
    where?: ZApiConfigWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ZApiConfigs to fetch.
     */
    orderBy?: ZApiConfigOrderByWithRelationInput | ZApiConfigOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ZApiConfigs.
     */
    cursor?: ZApiConfigWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ZApiConfigs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ZApiConfigs.
     */
    skip?: number
    distinct?: ZApiConfigScalarFieldEnum | ZApiConfigScalarFieldEnum[]
  }

  /**
   * ZApiConfig create
   */
  export type ZApiConfigCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ZApiConfig
     */
    select?: ZApiConfigSelect<ExtArgs> | null
    /**
     * The data needed to create a ZApiConfig.
     */
    data: XOR<ZApiConfigCreateInput, ZApiConfigUncheckedCreateInput>
  }

  /**
   * ZApiConfig createMany
   */
  export type ZApiConfigCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ZApiConfigs.
     */
    data: ZApiConfigCreateManyInput | ZApiConfigCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ZApiConfig createManyAndReturn
   */
  export type ZApiConfigCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ZApiConfig
     */
    select?: ZApiConfigSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many ZApiConfigs.
     */
    data: ZApiConfigCreateManyInput | ZApiConfigCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ZApiConfig update
   */
  export type ZApiConfigUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ZApiConfig
     */
    select?: ZApiConfigSelect<ExtArgs> | null
    /**
     * The data needed to update a ZApiConfig.
     */
    data: XOR<ZApiConfigUpdateInput, ZApiConfigUncheckedUpdateInput>
    /**
     * Choose, which ZApiConfig to update.
     */
    where: ZApiConfigWhereUniqueInput
  }

  /**
   * ZApiConfig updateMany
   */
  export type ZApiConfigUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ZApiConfigs.
     */
    data: XOR<ZApiConfigUpdateManyMutationInput, ZApiConfigUncheckedUpdateManyInput>
    /**
     * Filter which ZApiConfigs to update
     */
    where?: ZApiConfigWhereInput
  }

  /**
   * ZApiConfig upsert
   */
  export type ZApiConfigUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ZApiConfig
     */
    select?: ZApiConfigSelect<ExtArgs> | null
    /**
     * The filter to search for the ZApiConfig to update in case it exists.
     */
    where: ZApiConfigWhereUniqueInput
    /**
     * In case the ZApiConfig found by the `where` argument doesn't exist, create a new ZApiConfig with this data.
     */
    create: XOR<ZApiConfigCreateInput, ZApiConfigUncheckedCreateInput>
    /**
     * In case the ZApiConfig was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ZApiConfigUpdateInput, ZApiConfigUncheckedUpdateInput>
  }

  /**
   * ZApiConfig delete
   */
  export type ZApiConfigDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ZApiConfig
     */
    select?: ZApiConfigSelect<ExtArgs> | null
    /**
     * Filter which ZApiConfig to delete.
     */
    where: ZApiConfigWhereUniqueInput
  }

  /**
   * ZApiConfig deleteMany
   */
  export type ZApiConfigDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ZApiConfigs to delete
     */
    where?: ZApiConfigWhereInput
  }

  /**
   * ZApiConfig without action
   */
  export type ZApiConfigDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ZApiConfig
     */
    select?: ZApiConfigSelect<ExtArgs> | null
  }


  /**
   * Model Shortcut
   */

  export type AggregateShortcut = {
    _count: ShortcutCountAggregateOutputType | null
    _avg: ShortcutAvgAggregateOutputType | null
    _sum: ShortcutSumAggregateOutputType | null
    _min: ShortcutMinAggregateOutputType | null
    _max: ShortcutMaxAggregateOutputType | null
  }

  export type ShortcutAvgAggregateOutputType = {
    sortOrder: number | null
  }

  export type ShortcutSumAggregateOutputType = {
    sortOrder: number | null
  }

  export type ShortcutMinAggregateOutputType = {
    id: string | null
    title: string | null
    message: string | null
    type: $Enums.ShortcutType | null
    scope: $Enums.ShortcutScope | null
    departmentId: string | null
    ownerId: string | null
    isActive: boolean | null
    sortOrder: number | null
    createdById: string | null
    updatedById: string | null
    createdAt: Date | null
    updatedAt: Date | null
    archivedAt: Date | null
  }

  export type ShortcutMaxAggregateOutputType = {
    id: string | null
    title: string | null
    message: string | null
    type: $Enums.ShortcutType | null
    scope: $Enums.ShortcutScope | null
    departmentId: string | null
    ownerId: string | null
    isActive: boolean | null
    sortOrder: number | null
    createdById: string | null
    updatedById: string | null
    createdAt: Date | null
    updatedAt: Date | null
    archivedAt: Date | null
  }

  export type ShortcutCountAggregateOutputType = {
    id: number
    title: number
    message: number
    type: number
    scope: number
    departmentId: number
    ownerId: number
    isActive: number
    sortOrder: number
    createdById: number
    updatedById: number
    createdAt: number
    updatedAt: number
    archivedAt: number
    _all: number
  }


  export type ShortcutAvgAggregateInputType = {
    sortOrder?: true
  }

  export type ShortcutSumAggregateInputType = {
    sortOrder?: true
  }

  export type ShortcutMinAggregateInputType = {
    id?: true
    title?: true
    message?: true
    type?: true
    scope?: true
    departmentId?: true
    ownerId?: true
    isActive?: true
    sortOrder?: true
    createdById?: true
    updatedById?: true
    createdAt?: true
    updatedAt?: true
    archivedAt?: true
  }

  export type ShortcutMaxAggregateInputType = {
    id?: true
    title?: true
    message?: true
    type?: true
    scope?: true
    departmentId?: true
    ownerId?: true
    isActive?: true
    sortOrder?: true
    createdById?: true
    updatedById?: true
    createdAt?: true
    updatedAt?: true
    archivedAt?: true
  }

  export type ShortcutCountAggregateInputType = {
    id?: true
    title?: true
    message?: true
    type?: true
    scope?: true
    departmentId?: true
    ownerId?: true
    isActive?: true
    sortOrder?: true
    createdById?: true
    updatedById?: true
    createdAt?: true
    updatedAt?: true
    archivedAt?: true
    _all?: true
  }

  export type ShortcutAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Shortcut to aggregate.
     */
    where?: ShortcutWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Shortcuts to fetch.
     */
    orderBy?: ShortcutOrderByWithRelationInput | ShortcutOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ShortcutWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Shortcuts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Shortcuts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Shortcuts
    **/
    _count?: true | ShortcutCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ShortcutAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ShortcutSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ShortcutMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ShortcutMaxAggregateInputType
  }

  export type GetShortcutAggregateType<T extends ShortcutAggregateArgs> = {
        [P in keyof T & keyof AggregateShortcut]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateShortcut[P]>
      : GetScalarType<T[P], AggregateShortcut[P]>
  }




  export type ShortcutGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ShortcutWhereInput
    orderBy?: ShortcutOrderByWithAggregationInput | ShortcutOrderByWithAggregationInput[]
    by: ShortcutScalarFieldEnum[] | ShortcutScalarFieldEnum
    having?: ShortcutScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ShortcutCountAggregateInputType | true
    _avg?: ShortcutAvgAggregateInputType
    _sum?: ShortcutSumAggregateInputType
    _min?: ShortcutMinAggregateInputType
    _max?: ShortcutMaxAggregateInputType
  }

  export type ShortcutGroupByOutputType = {
    id: string
    title: string
    message: string
    type: $Enums.ShortcutType
    scope: $Enums.ShortcutScope
    departmentId: string | null
    ownerId: string | null
    isActive: boolean
    sortOrder: number
    createdById: string
    updatedById: string | null
    createdAt: Date
    updatedAt: Date
    archivedAt: Date | null
    _count: ShortcutCountAggregateOutputType | null
    _avg: ShortcutAvgAggregateOutputType | null
    _sum: ShortcutSumAggregateOutputType | null
    _min: ShortcutMinAggregateOutputType | null
    _max: ShortcutMaxAggregateOutputType | null
  }

  type GetShortcutGroupByPayload<T extends ShortcutGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ShortcutGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ShortcutGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ShortcutGroupByOutputType[P]>
            : GetScalarType<T[P], ShortcutGroupByOutputType[P]>
        }
      >
    >


  export type ShortcutSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    title?: boolean
    message?: boolean
    type?: boolean
    scope?: boolean
    departmentId?: boolean
    ownerId?: boolean
    isActive?: boolean
    sortOrder?: boolean
    createdById?: boolean
    updatedById?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    archivedAt?: boolean
    department?: boolean | Shortcut$departmentArgs<ExtArgs>
    owner?: boolean | Shortcut$ownerArgs<ExtArgs>
    createdBy?: boolean | AgentDefaultArgs<ExtArgs>
    updatedBy?: boolean | Shortcut$updatedByArgs<ExtArgs>
    audits?: boolean | Shortcut$auditsArgs<ExtArgs>
    _count?: boolean | ShortcutCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["shortcut"]>

  export type ShortcutSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    title?: boolean
    message?: boolean
    type?: boolean
    scope?: boolean
    departmentId?: boolean
    ownerId?: boolean
    isActive?: boolean
    sortOrder?: boolean
    createdById?: boolean
    updatedById?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    archivedAt?: boolean
    department?: boolean | Shortcut$departmentArgs<ExtArgs>
    owner?: boolean | Shortcut$ownerArgs<ExtArgs>
    createdBy?: boolean | AgentDefaultArgs<ExtArgs>
    updatedBy?: boolean | Shortcut$updatedByArgs<ExtArgs>
  }, ExtArgs["result"]["shortcut"]>

  export type ShortcutSelectScalar = {
    id?: boolean
    title?: boolean
    message?: boolean
    type?: boolean
    scope?: boolean
    departmentId?: boolean
    ownerId?: boolean
    isActive?: boolean
    sortOrder?: boolean
    createdById?: boolean
    updatedById?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    archivedAt?: boolean
  }

  export type ShortcutInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    department?: boolean | Shortcut$departmentArgs<ExtArgs>
    owner?: boolean | Shortcut$ownerArgs<ExtArgs>
    createdBy?: boolean | AgentDefaultArgs<ExtArgs>
    updatedBy?: boolean | Shortcut$updatedByArgs<ExtArgs>
    audits?: boolean | Shortcut$auditsArgs<ExtArgs>
    _count?: boolean | ShortcutCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type ShortcutIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    department?: boolean | Shortcut$departmentArgs<ExtArgs>
    owner?: boolean | Shortcut$ownerArgs<ExtArgs>
    createdBy?: boolean | AgentDefaultArgs<ExtArgs>
    updatedBy?: boolean | Shortcut$updatedByArgs<ExtArgs>
  }

  export type $ShortcutPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Shortcut"
    objects: {
      department: Prisma.$DepartmentPayload<ExtArgs> | null
      owner: Prisma.$AgentPayload<ExtArgs> | null
      createdBy: Prisma.$AgentPayload<ExtArgs>
      updatedBy: Prisma.$AgentPayload<ExtArgs> | null
      audits: Prisma.$ShortcutAuditPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      title: string
      message: string
      type: $Enums.ShortcutType
      scope: $Enums.ShortcutScope
      departmentId: string | null
      ownerId: string | null
      isActive: boolean
      sortOrder: number
      createdById: string
      updatedById: string | null
      createdAt: Date
      updatedAt: Date
      archivedAt: Date | null
    }, ExtArgs["result"]["shortcut"]>
    composites: {}
  }

  type ShortcutGetPayload<S extends boolean | null | undefined | ShortcutDefaultArgs> = $Result.GetResult<Prisma.$ShortcutPayload, S>

  type ShortcutCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<ShortcutFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: ShortcutCountAggregateInputType | true
    }

  export interface ShortcutDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Shortcut'], meta: { name: 'Shortcut' } }
    /**
     * Find zero or one Shortcut that matches the filter.
     * @param {ShortcutFindUniqueArgs} args - Arguments to find a Shortcut
     * @example
     * // Get one Shortcut
     * const shortcut = await prisma.shortcut.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ShortcutFindUniqueArgs>(args: SelectSubset<T, ShortcutFindUniqueArgs<ExtArgs>>): Prisma__ShortcutClient<$Result.GetResult<Prisma.$ShortcutPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Shortcut that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {ShortcutFindUniqueOrThrowArgs} args - Arguments to find a Shortcut
     * @example
     * // Get one Shortcut
     * const shortcut = await prisma.shortcut.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ShortcutFindUniqueOrThrowArgs>(args: SelectSubset<T, ShortcutFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ShortcutClient<$Result.GetResult<Prisma.$ShortcutPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Shortcut that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ShortcutFindFirstArgs} args - Arguments to find a Shortcut
     * @example
     * // Get one Shortcut
     * const shortcut = await prisma.shortcut.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ShortcutFindFirstArgs>(args?: SelectSubset<T, ShortcutFindFirstArgs<ExtArgs>>): Prisma__ShortcutClient<$Result.GetResult<Prisma.$ShortcutPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Shortcut that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ShortcutFindFirstOrThrowArgs} args - Arguments to find a Shortcut
     * @example
     * // Get one Shortcut
     * const shortcut = await prisma.shortcut.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ShortcutFindFirstOrThrowArgs>(args?: SelectSubset<T, ShortcutFindFirstOrThrowArgs<ExtArgs>>): Prisma__ShortcutClient<$Result.GetResult<Prisma.$ShortcutPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Shortcuts that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ShortcutFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Shortcuts
     * const shortcuts = await prisma.shortcut.findMany()
     * 
     * // Get first 10 Shortcuts
     * const shortcuts = await prisma.shortcut.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const shortcutWithIdOnly = await prisma.shortcut.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ShortcutFindManyArgs>(args?: SelectSubset<T, ShortcutFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ShortcutPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Shortcut.
     * @param {ShortcutCreateArgs} args - Arguments to create a Shortcut.
     * @example
     * // Create one Shortcut
     * const Shortcut = await prisma.shortcut.create({
     *   data: {
     *     // ... data to create a Shortcut
     *   }
     * })
     * 
     */
    create<T extends ShortcutCreateArgs>(args: SelectSubset<T, ShortcutCreateArgs<ExtArgs>>): Prisma__ShortcutClient<$Result.GetResult<Prisma.$ShortcutPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Shortcuts.
     * @param {ShortcutCreateManyArgs} args - Arguments to create many Shortcuts.
     * @example
     * // Create many Shortcuts
     * const shortcut = await prisma.shortcut.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ShortcutCreateManyArgs>(args?: SelectSubset<T, ShortcutCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Shortcuts and returns the data saved in the database.
     * @param {ShortcutCreateManyAndReturnArgs} args - Arguments to create many Shortcuts.
     * @example
     * // Create many Shortcuts
     * const shortcut = await prisma.shortcut.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Shortcuts and only return the `id`
     * const shortcutWithIdOnly = await prisma.shortcut.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ShortcutCreateManyAndReturnArgs>(args?: SelectSubset<T, ShortcutCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ShortcutPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Shortcut.
     * @param {ShortcutDeleteArgs} args - Arguments to delete one Shortcut.
     * @example
     * // Delete one Shortcut
     * const Shortcut = await prisma.shortcut.delete({
     *   where: {
     *     // ... filter to delete one Shortcut
     *   }
     * })
     * 
     */
    delete<T extends ShortcutDeleteArgs>(args: SelectSubset<T, ShortcutDeleteArgs<ExtArgs>>): Prisma__ShortcutClient<$Result.GetResult<Prisma.$ShortcutPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Shortcut.
     * @param {ShortcutUpdateArgs} args - Arguments to update one Shortcut.
     * @example
     * // Update one Shortcut
     * const shortcut = await prisma.shortcut.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ShortcutUpdateArgs>(args: SelectSubset<T, ShortcutUpdateArgs<ExtArgs>>): Prisma__ShortcutClient<$Result.GetResult<Prisma.$ShortcutPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Shortcuts.
     * @param {ShortcutDeleteManyArgs} args - Arguments to filter Shortcuts to delete.
     * @example
     * // Delete a few Shortcuts
     * const { count } = await prisma.shortcut.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ShortcutDeleteManyArgs>(args?: SelectSubset<T, ShortcutDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Shortcuts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ShortcutUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Shortcuts
     * const shortcut = await prisma.shortcut.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ShortcutUpdateManyArgs>(args: SelectSubset<T, ShortcutUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Shortcut.
     * @param {ShortcutUpsertArgs} args - Arguments to update or create a Shortcut.
     * @example
     * // Update or create a Shortcut
     * const shortcut = await prisma.shortcut.upsert({
     *   create: {
     *     // ... data to create a Shortcut
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Shortcut we want to update
     *   }
     * })
     */
    upsert<T extends ShortcutUpsertArgs>(args: SelectSubset<T, ShortcutUpsertArgs<ExtArgs>>): Prisma__ShortcutClient<$Result.GetResult<Prisma.$ShortcutPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Shortcuts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ShortcutCountArgs} args - Arguments to filter Shortcuts to count.
     * @example
     * // Count the number of Shortcuts
     * const count = await prisma.shortcut.count({
     *   where: {
     *     // ... the filter for the Shortcuts we want to count
     *   }
     * })
    **/
    count<T extends ShortcutCountArgs>(
      args?: Subset<T, ShortcutCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ShortcutCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Shortcut.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ShortcutAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ShortcutAggregateArgs>(args: Subset<T, ShortcutAggregateArgs>): Prisma.PrismaPromise<GetShortcutAggregateType<T>>

    /**
     * Group by Shortcut.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ShortcutGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ShortcutGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ShortcutGroupByArgs['orderBy'] }
        : { orderBy?: ShortcutGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ShortcutGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetShortcutGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Shortcut model
   */
  readonly fields: ShortcutFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Shortcut.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ShortcutClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    department<T extends Shortcut$departmentArgs<ExtArgs> = {}>(args?: Subset<T, Shortcut$departmentArgs<ExtArgs>>): Prisma__DepartmentClient<$Result.GetResult<Prisma.$DepartmentPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    owner<T extends Shortcut$ownerArgs<ExtArgs> = {}>(args?: Subset<T, Shortcut$ownerArgs<ExtArgs>>): Prisma__AgentClient<$Result.GetResult<Prisma.$AgentPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    createdBy<T extends AgentDefaultArgs<ExtArgs> = {}>(args?: Subset<T, AgentDefaultArgs<ExtArgs>>): Prisma__AgentClient<$Result.GetResult<Prisma.$AgentPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    updatedBy<T extends Shortcut$updatedByArgs<ExtArgs> = {}>(args?: Subset<T, Shortcut$updatedByArgs<ExtArgs>>): Prisma__AgentClient<$Result.GetResult<Prisma.$AgentPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    audits<T extends Shortcut$auditsArgs<ExtArgs> = {}>(args?: Subset<T, Shortcut$auditsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ShortcutAuditPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Shortcut model
   */ 
  interface ShortcutFieldRefs {
    readonly id: FieldRef<"Shortcut", 'String'>
    readonly title: FieldRef<"Shortcut", 'String'>
    readonly message: FieldRef<"Shortcut", 'String'>
    readonly type: FieldRef<"Shortcut", 'ShortcutType'>
    readonly scope: FieldRef<"Shortcut", 'ShortcutScope'>
    readonly departmentId: FieldRef<"Shortcut", 'String'>
    readonly ownerId: FieldRef<"Shortcut", 'String'>
    readonly isActive: FieldRef<"Shortcut", 'Boolean'>
    readonly sortOrder: FieldRef<"Shortcut", 'Int'>
    readonly createdById: FieldRef<"Shortcut", 'String'>
    readonly updatedById: FieldRef<"Shortcut", 'String'>
    readonly createdAt: FieldRef<"Shortcut", 'DateTime'>
    readonly updatedAt: FieldRef<"Shortcut", 'DateTime'>
    readonly archivedAt: FieldRef<"Shortcut", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Shortcut findUnique
   */
  export type ShortcutFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Shortcut
     */
    select?: ShortcutSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShortcutInclude<ExtArgs> | null
    /**
     * Filter, which Shortcut to fetch.
     */
    where: ShortcutWhereUniqueInput
  }

  /**
   * Shortcut findUniqueOrThrow
   */
  export type ShortcutFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Shortcut
     */
    select?: ShortcutSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShortcutInclude<ExtArgs> | null
    /**
     * Filter, which Shortcut to fetch.
     */
    where: ShortcutWhereUniqueInput
  }

  /**
   * Shortcut findFirst
   */
  export type ShortcutFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Shortcut
     */
    select?: ShortcutSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShortcutInclude<ExtArgs> | null
    /**
     * Filter, which Shortcut to fetch.
     */
    where?: ShortcutWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Shortcuts to fetch.
     */
    orderBy?: ShortcutOrderByWithRelationInput | ShortcutOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Shortcuts.
     */
    cursor?: ShortcutWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Shortcuts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Shortcuts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Shortcuts.
     */
    distinct?: ShortcutScalarFieldEnum | ShortcutScalarFieldEnum[]
  }

  /**
   * Shortcut findFirstOrThrow
   */
  export type ShortcutFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Shortcut
     */
    select?: ShortcutSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShortcutInclude<ExtArgs> | null
    /**
     * Filter, which Shortcut to fetch.
     */
    where?: ShortcutWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Shortcuts to fetch.
     */
    orderBy?: ShortcutOrderByWithRelationInput | ShortcutOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Shortcuts.
     */
    cursor?: ShortcutWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Shortcuts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Shortcuts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Shortcuts.
     */
    distinct?: ShortcutScalarFieldEnum | ShortcutScalarFieldEnum[]
  }

  /**
   * Shortcut findMany
   */
  export type ShortcutFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Shortcut
     */
    select?: ShortcutSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShortcutInclude<ExtArgs> | null
    /**
     * Filter, which Shortcuts to fetch.
     */
    where?: ShortcutWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Shortcuts to fetch.
     */
    orderBy?: ShortcutOrderByWithRelationInput | ShortcutOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Shortcuts.
     */
    cursor?: ShortcutWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Shortcuts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Shortcuts.
     */
    skip?: number
    distinct?: ShortcutScalarFieldEnum | ShortcutScalarFieldEnum[]
  }

  /**
   * Shortcut create
   */
  export type ShortcutCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Shortcut
     */
    select?: ShortcutSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShortcutInclude<ExtArgs> | null
    /**
     * The data needed to create a Shortcut.
     */
    data: XOR<ShortcutCreateInput, ShortcutUncheckedCreateInput>
  }

  /**
   * Shortcut createMany
   */
  export type ShortcutCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Shortcuts.
     */
    data: ShortcutCreateManyInput | ShortcutCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Shortcut createManyAndReturn
   */
  export type ShortcutCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Shortcut
     */
    select?: ShortcutSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Shortcuts.
     */
    data: ShortcutCreateManyInput | ShortcutCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShortcutIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Shortcut update
   */
  export type ShortcutUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Shortcut
     */
    select?: ShortcutSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShortcutInclude<ExtArgs> | null
    /**
     * The data needed to update a Shortcut.
     */
    data: XOR<ShortcutUpdateInput, ShortcutUncheckedUpdateInput>
    /**
     * Choose, which Shortcut to update.
     */
    where: ShortcutWhereUniqueInput
  }

  /**
   * Shortcut updateMany
   */
  export type ShortcutUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Shortcuts.
     */
    data: XOR<ShortcutUpdateManyMutationInput, ShortcutUncheckedUpdateManyInput>
    /**
     * Filter which Shortcuts to update
     */
    where?: ShortcutWhereInput
  }

  /**
   * Shortcut upsert
   */
  export type ShortcutUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Shortcut
     */
    select?: ShortcutSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShortcutInclude<ExtArgs> | null
    /**
     * The filter to search for the Shortcut to update in case it exists.
     */
    where: ShortcutWhereUniqueInput
    /**
     * In case the Shortcut found by the `where` argument doesn't exist, create a new Shortcut with this data.
     */
    create: XOR<ShortcutCreateInput, ShortcutUncheckedCreateInput>
    /**
     * In case the Shortcut was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ShortcutUpdateInput, ShortcutUncheckedUpdateInput>
  }

  /**
   * Shortcut delete
   */
  export type ShortcutDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Shortcut
     */
    select?: ShortcutSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShortcutInclude<ExtArgs> | null
    /**
     * Filter which Shortcut to delete.
     */
    where: ShortcutWhereUniqueInput
  }

  /**
   * Shortcut deleteMany
   */
  export type ShortcutDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Shortcuts to delete
     */
    where?: ShortcutWhereInput
  }

  /**
   * Shortcut.department
   */
  export type Shortcut$departmentArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Department
     */
    select?: DepartmentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DepartmentInclude<ExtArgs> | null
    where?: DepartmentWhereInput
  }

  /**
   * Shortcut.owner
   */
  export type Shortcut$ownerArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Agent
     */
    select?: AgentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgentInclude<ExtArgs> | null
    where?: AgentWhereInput
  }

  /**
   * Shortcut.updatedBy
   */
  export type Shortcut$updatedByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Agent
     */
    select?: AgentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgentInclude<ExtArgs> | null
    where?: AgentWhereInput
  }

  /**
   * Shortcut.audits
   */
  export type Shortcut$auditsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ShortcutAudit
     */
    select?: ShortcutAuditSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShortcutAuditInclude<ExtArgs> | null
    where?: ShortcutAuditWhereInput
    orderBy?: ShortcutAuditOrderByWithRelationInput | ShortcutAuditOrderByWithRelationInput[]
    cursor?: ShortcutAuditWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ShortcutAuditScalarFieldEnum | ShortcutAuditScalarFieldEnum[]
  }

  /**
   * Shortcut without action
   */
  export type ShortcutDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Shortcut
     */
    select?: ShortcutSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShortcutInclude<ExtArgs> | null
  }


  /**
   * Model ShortcutAudit
   */

  export type AggregateShortcutAudit = {
    _count: ShortcutAuditCountAggregateOutputType | null
    _min: ShortcutAuditMinAggregateOutputType | null
    _max: ShortcutAuditMaxAggregateOutputType | null
  }

  export type ShortcutAuditMinAggregateOutputType = {
    id: string | null
    shortcutId: string | null
    actorId: string | null
    action: string | null
    createdAt: Date | null
  }

  export type ShortcutAuditMaxAggregateOutputType = {
    id: string | null
    shortcutId: string | null
    actorId: string | null
    action: string | null
    createdAt: Date | null
  }

  export type ShortcutAuditCountAggregateOutputType = {
    id: number
    shortcutId: number
    actorId: number
    action: number
    metadata: number
    createdAt: number
    _all: number
  }


  export type ShortcutAuditMinAggregateInputType = {
    id?: true
    shortcutId?: true
    actorId?: true
    action?: true
    createdAt?: true
  }

  export type ShortcutAuditMaxAggregateInputType = {
    id?: true
    shortcutId?: true
    actorId?: true
    action?: true
    createdAt?: true
  }

  export type ShortcutAuditCountAggregateInputType = {
    id?: true
    shortcutId?: true
    actorId?: true
    action?: true
    metadata?: true
    createdAt?: true
    _all?: true
  }

  export type ShortcutAuditAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ShortcutAudit to aggregate.
     */
    where?: ShortcutAuditWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ShortcutAudits to fetch.
     */
    orderBy?: ShortcutAuditOrderByWithRelationInput | ShortcutAuditOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ShortcutAuditWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ShortcutAudits from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ShortcutAudits.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ShortcutAudits
    **/
    _count?: true | ShortcutAuditCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ShortcutAuditMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ShortcutAuditMaxAggregateInputType
  }

  export type GetShortcutAuditAggregateType<T extends ShortcutAuditAggregateArgs> = {
        [P in keyof T & keyof AggregateShortcutAudit]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateShortcutAudit[P]>
      : GetScalarType<T[P], AggregateShortcutAudit[P]>
  }




  export type ShortcutAuditGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ShortcutAuditWhereInput
    orderBy?: ShortcutAuditOrderByWithAggregationInput | ShortcutAuditOrderByWithAggregationInput[]
    by: ShortcutAuditScalarFieldEnum[] | ShortcutAuditScalarFieldEnum
    having?: ShortcutAuditScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ShortcutAuditCountAggregateInputType | true
    _min?: ShortcutAuditMinAggregateInputType
    _max?: ShortcutAuditMaxAggregateInputType
  }

  export type ShortcutAuditGroupByOutputType = {
    id: string
    shortcutId: string | null
    actorId: string
    action: string
    metadata: JsonValue | null
    createdAt: Date
    _count: ShortcutAuditCountAggregateOutputType | null
    _min: ShortcutAuditMinAggregateOutputType | null
    _max: ShortcutAuditMaxAggregateOutputType | null
  }

  type GetShortcutAuditGroupByPayload<T extends ShortcutAuditGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ShortcutAuditGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ShortcutAuditGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ShortcutAuditGroupByOutputType[P]>
            : GetScalarType<T[P], ShortcutAuditGroupByOutputType[P]>
        }
      >
    >


  export type ShortcutAuditSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    shortcutId?: boolean
    actorId?: boolean
    action?: boolean
    metadata?: boolean
    createdAt?: boolean
    shortcut?: boolean | ShortcutAudit$shortcutArgs<ExtArgs>
    actor?: boolean | AgentDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["shortcutAudit"]>

  export type ShortcutAuditSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    shortcutId?: boolean
    actorId?: boolean
    action?: boolean
    metadata?: boolean
    createdAt?: boolean
    shortcut?: boolean | ShortcutAudit$shortcutArgs<ExtArgs>
    actor?: boolean | AgentDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["shortcutAudit"]>

  export type ShortcutAuditSelectScalar = {
    id?: boolean
    shortcutId?: boolean
    actorId?: boolean
    action?: boolean
    metadata?: boolean
    createdAt?: boolean
  }

  export type ShortcutAuditInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    shortcut?: boolean | ShortcutAudit$shortcutArgs<ExtArgs>
    actor?: boolean | AgentDefaultArgs<ExtArgs>
  }
  export type ShortcutAuditIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    shortcut?: boolean | ShortcutAudit$shortcutArgs<ExtArgs>
    actor?: boolean | AgentDefaultArgs<ExtArgs>
  }

  export type $ShortcutAuditPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ShortcutAudit"
    objects: {
      shortcut: Prisma.$ShortcutPayload<ExtArgs> | null
      actor: Prisma.$AgentPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      shortcutId: string | null
      actorId: string
      action: string
      metadata: Prisma.JsonValue | null
      createdAt: Date
    }, ExtArgs["result"]["shortcutAudit"]>
    composites: {}
  }

  type ShortcutAuditGetPayload<S extends boolean | null | undefined | ShortcutAuditDefaultArgs> = $Result.GetResult<Prisma.$ShortcutAuditPayload, S>

  type ShortcutAuditCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<ShortcutAuditFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: ShortcutAuditCountAggregateInputType | true
    }

  export interface ShortcutAuditDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ShortcutAudit'], meta: { name: 'ShortcutAudit' } }
    /**
     * Find zero or one ShortcutAudit that matches the filter.
     * @param {ShortcutAuditFindUniqueArgs} args - Arguments to find a ShortcutAudit
     * @example
     * // Get one ShortcutAudit
     * const shortcutAudit = await prisma.shortcutAudit.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ShortcutAuditFindUniqueArgs>(args: SelectSubset<T, ShortcutAuditFindUniqueArgs<ExtArgs>>): Prisma__ShortcutAuditClient<$Result.GetResult<Prisma.$ShortcutAuditPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one ShortcutAudit that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {ShortcutAuditFindUniqueOrThrowArgs} args - Arguments to find a ShortcutAudit
     * @example
     * // Get one ShortcutAudit
     * const shortcutAudit = await prisma.shortcutAudit.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ShortcutAuditFindUniqueOrThrowArgs>(args: SelectSubset<T, ShortcutAuditFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ShortcutAuditClient<$Result.GetResult<Prisma.$ShortcutAuditPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first ShortcutAudit that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ShortcutAuditFindFirstArgs} args - Arguments to find a ShortcutAudit
     * @example
     * // Get one ShortcutAudit
     * const shortcutAudit = await prisma.shortcutAudit.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ShortcutAuditFindFirstArgs>(args?: SelectSubset<T, ShortcutAuditFindFirstArgs<ExtArgs>>): Prisma__ShortcutAuditClient<$Result.GetResult<Prisma.$ShortcutAuditPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first ShortcutAudit that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ShortcutAuditFindFirstOrThrowArgs} args - Arguments to find a ShortcutAudit
     * @example
     * // Get one ShortcutAudit
     * const shortcutAudit = await prisma.shortcutAudit.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ShortcutAuditFindFirstOrThrowArgs>(args?: SelectSubset<T, ShortcutAuditFindFirstOrThrowArgs<ExtArgs>>): Prisma__ShortcutAuditClient<$Result.GetResult<Prisma.$ShortcutAuditPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more ShortcutAudits that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ShortcutAuditFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ShortcutAudits
     * const shortcutAudits = await prisma.shortcutAudit.findMany()
     * 
     * // Get first 10 ShortcutAudits
     * const shortcutAudits = await prisma.shortcutAudit.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const shortcutAuditWithIdOnly = await prisma.shortcutAudit.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ShortcutAuditFindManyArgs>(args?: SelectSubset<T, ShortcutAuditFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ShortcutAuditPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a ShortcutAudit.
     * @param {ShortcutAuditCreateArgs} args - Arguments to create a ShortcutAudit.
     * @example
     * // Create one ShortcutAudit
     * const ShortcutAudit = await prisma.shortcutAudit.create({
     *   data: {
     *     // ... data to create a ShortcutAudit
     *   }
     * })
     * 
     */
    create<T extends ShortcutAuditCreateArgs>(args: SelectSubset<T, ShortcutAuditCreateArgs<ExtArgs>>): Prisma__ShortcutAuditClient<$Result.GetResult<Prisma.$ShortcutAuditPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many ShortcutAudits.
     * @param {ShortcutAuditCreateManyArgs} args - Arguments to create many ShortcutAudits.
     * @example
     * // Create many ShortcutAudits
     * const shortcutAudit = await prisma.shortcutAudit.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ShortcutAuditCreateManyArgs>(args?: SelectSubset<T, ShortcutAuditCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ShortcutAudits and returns the data saved in the database.
     * @param {ShortcutAuditCreateManyAndReturnArgs} args - Arguments to create many ShortcutAudits.
     * @example
     * // Create many ShortcutAudits
     * const shortcutAudit = await prisma.shortcutAudit.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ShortcutAudits and only return the `id`
     * const shortcutAuditWithIdOnly = await prisma.shortcutAudit.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ShortcutAuditCreateManyAndReturnArgs>(args?: SelectSubset<T, ShortcutAuditCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ShortcutAuditPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a ShortcutAudit.
     * @param {ShortcutAuditDeleteArgs} args - Arguments to delete one ShortcutAudit.
     * @example
     * // Delete one ShortcutAudit
     * const ShortcutAudit = await prisma.shortcutAudit.delete({
     *   where: {
     *     // ... filter to delete one ShortcutAudit
     *   }
     * })
     * 
     */
    delete<T extends ShortcutAuditDeleteArgs>(args: SelectSubset<T, ShortcutAuditDeleteArgs<ExtArgs>>): Prisma__ShortcutAuditClient<$Result.GetResult<Prisma.$ShortcutAuditPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one ShortcutAudit.
     * @param {ShortcutAuditUpdateArgs} args - Arguments to update one ShortcutAudit.
     * @example
     * // Update one ShortcutAudit
     * const shortcutAudit = await prisma.shortcutAudit.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ShortcutAuditUpdateArgs>(args: SelectSubset<T, ShortcutAuditUpdateArgs<ExtArgs>>): Prisma__ShortcutAuditClient<$Result.GetResult<Prisma.$ShortcutAuditPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more ShortcutAudits.
     * @param {ShortcutAuditDeleteManyArgs} args - Arguments to filter ShortcutAudits to delete.
     * @example
     * // Delete a few ShortcutAudits
     * const { count } = await prisma.shortcutAudit.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ShortcutAuditDeleteManyArgs>(args?: SelectSubset<T, ShortcutAuditDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ShortcutAudits.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ShortcutAuditUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ShortcutAudits
     * const shortcutAudit = await prisma.shortcutAudit.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ShortcutAuditUpdateManyArgs>(args: SelectSubset<T, ShortcutAuditUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one ShortcutAudit.
     * @param {ShortcutAuditUpsertArgs} args - Arguments to update or create a ShortcutAudit.
     * @example
     * // Update or create a ShortcutAudit
     * const shortcutAudit = await prisma.shortcutAudit.upsert({
     *   create: {
     *     // ... data to create a ShortcutAudit
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ShortcutAudit we want to update
     *   }
     * })
     */
    upsert<T extends ShortcutAuditUpsertArgs>(args: SelectSubset<T, ShortcutAuditUpsertArgs<ExtArgs>>): Prisma__ShortcutAuditClient<$Result.GetResult<Prisma.$ShortcutAuditPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of ShortcutAudits.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ShortcutAuditCountArgs} args - Arguments to filter ShortcutAudits to count.
     * @example
     * // Count the number of ShortcutAudits
     * const count = await prisma.shortcutAudit.count({
     *   where: {
     *     // ... the filter for the ShortcutAudits we want to count
     *   }
     * })
    **/
    count<T extends ShortcutAuditCountArgs>(
      args?: Subset<T, ShortcutAuditCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ShortcutAuditCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ShortcutAudit.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ShortcutAuditAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ShortcutAuditAggregateArgs>(args: Subset<T, ShortcutAuditAggregateArgs>): Prisma.PrismaPromise<GetShortcutAuditAggregateType<T>>

    /**
     * Group by ShortcutAudit.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ShortcutAuditGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ShortcutAuditGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ShortcutAuditGroupByArgs['orderBy'] }
        : { orderBy?: ShortcutAuditGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ShortcutAuditGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetShortcutAuditGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ShortcutAudit model
   */
  readonly fields: ShortcutAuditFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ShortcutAudit.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ShortcutAuditClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    shortcut<T extends ShortcutAudit$shortcutArgs<ExtArgs> = {}>(args?: Subset<T, ShortcutAudit$shortcutArgs<ExtArgs>>): Prisma__ShortcutClient<$Result.GetResult<Prisma.$ShortcutPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    actor<T extends AgentDefaultArgs<ExtArgs> = {}>(args?: Subset<T, AgentDefaultArgs<ExtArgs>>): Prisma__AgentClient<$Result.GetResult<Prisma.$AgentPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the ShortcutAudit model
   */ 
  interface ShortcutAuditFieldRefs {
    readonly id: FieldRef<"ShortcutAudit", 'String'>
    readonly shortcutId: FieldRef<"ShortcutAudit", 'String'>
    readonly actorId: FieldRef<"ShortcutAudit", 'String'>
    readonly action: FieldRef<"ShortcutAudit", 'String'>
    readonly metadata: FieldRef<"ShortcutAudit", 'Json'>
    readonly createdAt: FieldRef<"ShortcutAudit", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ShortcutAudit findUnique
   */
  export type ShortcutAuditFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ShortcutAudit
     */
    select?: ShortcutAuditSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShortcutAuditInclude<ExtArgs> | null
    /**
     * Filter, which ShortcutAudit to fetch.
     */
    where: ShortcutAuditWhereUniqueInput
  }

  /**
   * ShortcutAudit findUniqueOrThrow
   */
  export type ShortcutAuditFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ShortcutAudit
     */
    select?: ShortcutAuditSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShortcutAuditInclude<ExtArgs> | null
    /**
     * Filter, which ShortcutAudit to fetch.
     */
    where: ShortcutAuditWhereUniqueInput
  }

  /**
   * ShortcutAudit findFirst
   */
  export type ShortcutAuditFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ShortcutAudit
     */
    select?: ShortcutAuditSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShortcutAuditInclude<ExtArgs> | null
    /**
     * Filter, which ShortcutAudit to fetch.
     */
    where?: ShortcutAuditWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ShortcutAudits to fetch.
     */
    orderBy?: ShortcutAuditOrderByWithRelationInput | ShortcutAuditOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ShortcutAudits.
     */
    cursor?: ShortcutAuditWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ShortcutAudits from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ShortcutAudits.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ShortcutAudits.
     */
    distinct?: ShortcutAuditScalarFieldEnum | ShortcutAuditScalarFieldEnum[]
  }

  /**
   * ShortcutAudit findFirstOrThrow
   */
  export type ShortcutAuditFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ShortcutAudit
     */
    select?: ShortcutAuditSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShortcutAuditInclude<ExtArgs> | null
    /**
     * Filter, which ShortcutAudit to fetch.
     */
    where?: ShortcutAuditWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ShortcutAudits to fetch.
     */
    orderBy?: ShortcutAuditOrderByWithRelationInput | ShortcutAuditOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ShortcutAudits.
     */
    cursor?: ShortcutAuditWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ShortcutAudits from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ShortcutAudits.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ShortcutAudits.
     */
    distinct?: ShortcutAuditScalarFieldEnum | ShortcutAuditScalarFieldEnum[]
  }

  /**
   * ShortcutAudit findMany
   */
  export type ShortcutAuditFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ShortcutAudit
     */
    select?: ShortcutAuditSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShortcutAuditInclude<ExtArgs> | null
    /**
     * Filter, which ShortcutAudits to fetch.
     */
    where?: ShortcutAuditWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ShortcutAudits to fetch.
     */
    orderBy?: ShortcutAuditOrderByWithRelationInput | ShortcutAuditOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ShortcutAudits.
     */
    cursor?: ShortcutAuditWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ShortcutAudits from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ShortcutAudits.
     */
    skip?: number
    distinct?: ShortcutAuditScalarFieldEnum | ShortcutAuditScalarFieldEnum[]
  }

  /**
   * ShortcutAudit create
   */
  export type ShortcutAuditCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ShortcutAudit
     */
    select?: ShortcutAuditSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShortcutAuditInclude<ExtArgs> | null
    /**
     * The data needed to create a ShortcutAudit.
     */
    data: XOR<ShortcutAuditCreateInput, ShortcutAuditUncheckedCreateInput>
  }

  /**
   * ShortcutAudit createMany
   */
  export type ShortcutAuditCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ShortcutAudits.
     */
    data: ShortcutAuditCreateManyInput | ShortcutAuditCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ShortcutAudit createManyAndReturn
   */
  export type ShortcutAuditCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ShortcutAudit
     */
    select?: ShortcutAuditSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many ShortcutAudits.
     */
    data: ShortcutAuditCreateManyInput | ShortcutAuditCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShortcutAuditIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * ShortcutAudit update
   */
  export type ShortcutAuditUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ShortcutAudit
     */
    select?: ShortcutAuditSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShortcutAuditInclude<ExtArgs> | null
    /**
     * The data needed to update a ShortcutAudit.
     */
    data: XOR<ShortcutAuditUpdateInput, ShortcutAuditUncheckedUpdateInput>
    /**
     * Choose, which ShortcutAudit to update.
     */
    where: ShortcutAuditWhereUniqueInput
  }

  /**
   * ShortcutAudit updateMany
   */
  export type ShortcutAuditUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ShortcutAudits.
     */
    data: XOR<ShortcutAuditUpdateManyMutationInput, ShortcutAuditUncheckedUpdateManyInput>
    /**
     * Filter which ShortcutAudits to update
     */
    where?: ShortcutAuditWhereInput
  }

  /**
   * ShortcutAudit upsert
   */
  export type ShortcutAuditUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ShortcutAudit
     */
    select?: ShortcutAuditSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShortcutAuditInclude<ExtArgs> | null
    /**
     * The filter to search for the ShortcutAudit to update in case it exists.
     */
    where: ShortcutAuditWhereUniqueInput
    /**
     * In case the ShortcutAudit found by the `where` argument doesn't exist, create a new ShortcutAudit with this data.
     */
    create: XOR<ShortcutAuditCreateInput, ShortcutAuditUncheckedCreateInput>
    /**
     * In case the ShortcutAudit was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ShortcutAuditUpdateInput, ShortcutAuditUncheckedUpdateInput>
  }

  /**
   * ShortcutAudit delete
   */
  export type ShortcutAuditDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ShortcutAudit
     */
    select?: ShortcutAuditSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShortcutAuditInclude<ExtArgs> | null
    /**
     * Filter which ShortcutAudit to delete.
     */
    where: ShortcutAuditWhereUniqueInput
  }

  /**
   * ShortcutAudit deleteMany
   */
  export type ShortcutAuditDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ShortcutAudits to delete
     */
    where?: ShortcutAuditWhereInput
  }

  /**
   * ShortcutAudit.shortcut
   */
  export type ShortcutAudit$shortcutArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Shortcut
     */
    select?: ShortcutSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShortcutInclude<ExtArgs> | null
    where?: ShortcutWhereInput
  }

  /**
   * ShortcutAudit without action
   */
  export type ShortcutAuditDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ShortcutAudit
     */
    select?: ShortcutAuditSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShortcutAuditInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const DepartmentScalarFieldEnum: {
    id: 'id',
    name: 'name',
    description: 'description',
    createdAt: 'createdAt'
  };

  export type DepartmentScalarFieldEnum = (typeof DepartmentScalarFieldEnum)[keyof typeof DepartmentScalarFieldEnum]


  export const ProcedureScalarFieldEnum: {
    id: 'id',
    departmentId: 'departmentId',
    title: 'title',
    content: 'content',
    order: 'order'
  };

  export type ProcedureScalarFieldEnum = (typeof ProcedureScalarFieldEnum)[keyof typeof ProcedureScalarFieldEnum]


  export const AgentScalarFieldEnum: {
    id: 'id',
    name: 'name',
    email: 'email',
    password: 'password',
    role: 'role',
    isActive: 'isActive',
    departmentId: 'departmentId',
    isOnline: 'isOnline',
    createdAt: 'createdAt'
  };

  export type AgentScalarFieldEnum = (typeof AgentScalarFieldEnum)[keyof typeof AgentScalarFieldEnum]


  export const RolePermissionScalarFieldEnum: {
    id: 'id',
    role: 'role',
    resource: 'resource',
    actions: 'actions',
    updatedAt: 'updatedAt'
  };

  export type RolePermissionScalarFieldEnum = (typeof RolePermissionScalarFieldEnum)[keyof typeof RolePermissionScalarFieldEnum]


  export const ContactScalarFieldEnum: {
    id: 'id',
    phone: 'phone',
    name: 'name',
    createdAt: 'createdAt'
  };

  export type ContactScalarFieldEnum = (typeof ContactScalarFieldEnum)[keyof typeof ContactScalarFieldEnum]


  export const ConversationScalarFieldEnum: {
    id: 'id',
    contactId: 'contactId',
    status: 'status',
    departmentId: 'departmentId',
    assignedAgentId: 'assignedAgentId',
    currentStep: 'currentStep',
    startedAt: 'startedAt',
    closedAt: 'closedAt'
  };

  export type ConversationScalarFieldEnum = (typeof ConversationScalarFieldEnum)[keyof typeof ConversationScalarFieldEnum]


  export const MessageScalarFieldEnum: {
    id: 'id',
    conversationId: 'conversationId',
    direction: 'direction',
    senderType: 'senderType',
    senderAgentId: 'senderAgentId',
    content: 'content',
    createdAt: 'createdAt',
    readAt: 'readAt'
  };

  export type MessageScalarFieldEnum = (typeof MessageScalarFieldEnum)[keyof typeof MessageScalarFieldEnum]


  export const FlowDefinitionScalarFieldEnum: {
    id: 'id',
    name: 'name',
    greeting: 'greeting',
    menuMessage: 'menuMessage',
    options: 'options',
    updatedAt: 'updatedAt'
  };

  export type FlowDefinitionScalarFieldEnum = (typeof FlowDefinitionScalarFieldEnum)[keyof typeof FlowDefinitionScalarFieldEnum]


  export const ZApiConfigScalarFieldEnum: {
    id: 'id',
    instanceId: 'instanceId',
    token: 'token',
    clientToken: 'clientToken',
    webhookUrl: 'webhookUrl',
    isActive: 'isActive',
    autoReply: 'autoReply',
    updatedAt: 'updatedAt'
  };

  export type ZApiConfigScalarFieldEnum = (typeof ZApiConfigScalarFieldEnum)[keyof typeof ZApiConfigScalarFieldEnum]


  export const ShortcutScalarFieldEnum: {
    id: 'id',
    title: 'title',
    message: 'message',
    type: 'type',
    scope: 'scope',
    departmentId: 'departmentId',
    ownerId: 'ownerId',
    isActive: 'isActive',
    sortOrder: 'sortOrder',
    createdById: 'createdById',
    updatedById: 'updatedById',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    archivedAt: 'archivedAt'
  };

  export type ShortcutScalarFieldEnum = (typeof ShortcutScalarFieldEnum)[keyof typeof ShortcutScalarFieldEnum]


  export const ShortcutAuditScalarFieldEnum: {
    id: 'id',
    shortcutId: 'shortcutId',
    actorId: 'actorId',
    action: 'action',
    metadata: 'metadata',
    createdAt: 'createdAt'
  };

  export type ShortcutAuditScalarFieldEnum = (typeof ShortcutAuditScalarFieldEnum)[keyof typeof ShortcutAuditScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const JsonNullValueInput: {
    JsonNull: typeof JsonNull
  };

  export type JsonNullValueInput = (typeof JsonNullValueInput)[keyof typeof JsonNullValueInput]


  export const NullableJsonNullValueInput: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull
  };

  export type NullableJsonNullValueInput = (typeof NullableJsonNullValueInput)[keyof typeof NullableJsonNullValueInput]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


  /**
   * Field references 
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'ShortcutType'
   */
  export type EnumShortcutTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ShortcutType'>
    


  /**
   * Reference to a field of type 'ShortcutType[]'
   */
  export type ListEnumShortcutTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ShortcutType[]'>
    


  /**
   * Reference to a field of type 'ShortcutScope'
   */
  export type EnumShortcutScopeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ShortcutScope'>
    


  /**
   * Reference to a field of type 'ShortcutScope[]'
   */
  export type ListEnumShortcutScopeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ShortcutScope[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type DepartmentWhereInput = {
    AND?: DepartmentWhereInput | DepartmentWhereInput[]
    OR?: DepartmentWhereInput[]
    NOT?: DepartmentWhereInput | DepartmentWhereInput[]
    id?: StringFilter<"Department"> | string
    name?: StringFilter<"Department"> | string
    description?: StringNullableFilter<"Department"> | string | null
    createdAt?: DateTimeFilter<"Department"> | Date | string
    procedures?: ProcedureListRelationFilter
    agents?: AgentListRelationFilter
    conversations?: ConversationListRelationFilter
    shortcuts?: ShortcutListRelationFilter
  }

  export type DepartmentOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    procedures?: ProcedureOrderByRelationAggregateInput
    agents?: AgentOrderByRelationAggregateInput
    conversations?: ConversationOrderByRelationAggregateInput
    shortcuts?: ShortcutOrderByRelationAggregateInput
  }

  export type DepartmentWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: DepartmentWhereInput | DepartmentWhereInput[]
    OR?: DepartmentWhereInput[]
    NOT?: DepartmentWhereInput | DepartmentWhereInput[]
    name?: StringFilter<"Department"> | string
    description?: StringNullableFilter<"Department"> | string | null
    createdAt?: DateTimeFilter<"Department"> | Date | string
    procedures?: ProcedureListRelationFilter
    agents?: AgentListRelationFilter
    conversations?: ConversationListRelationFilter
    shortcuts?: ShortcutListRelationFilter
  }, "id">

  export type DepartmentOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: DepartmentCountOrderByAggregateInput
    _max?: DepartmentMaxOrderByAggregateInput
    _min?: DepartmentMinOrderByAggregateInput
  }

  export type DepartmentScalarWhereWithAggregatesInput = {
    AND?: DepartmentScalarWhereWithAggregatesInput | DepartmentScalarWhereWithAggregatesInput[]
    OR?: DepartmentScalarWhereWithAggregatesInput[]
    NOT?: DepartmentScalarWhereWithAggregatesInput | DepartmentScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Department"> | string
    name?: StringWithAggregatesFilter<"Department"> | string
    description?: StringNullableWithAggregatesFilter<"Department"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Department"> | Date | string
  }

  export type ProcedureWhereInput = {
    AND?: ProcedureWhereInput | ProcedureWhereInput[]
    OR?: ProcedureWhereInput[]
    NOT?: ProcedureWhereInput | ProcedureWhereInput[]
    id?: StringFilter<"Procedure"> | string
    departmentId?: StringFilter<"Procedure"> | string
    title?: StringFilter<"Procedure"> | string
    content?: StringFilter<"Procedure"> | string
    order?: IntFilter<"Procedure"> | number
    department?: XOR<DepartmentRelationFilter, DepartmentWhereInput>
  }

  export type ProcedureOrderByWithRelationInput = {
    id?: SortOrder
    departmentId?: SortOrder
    title?: SortOrder
    content?: SortOrder
    order?: SortOrder
    department?: DepartmentOrderByWithRelationInput
  }

  export type ProcedureWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ProcedureWhereInput | ProcedureWhereInput[]
    OR?: ProcedureWhereInput[]
    NOT?: ProcedureWhereInput | ProcedureWhereInput[]
    departmentId?: StringFilter<"Procedure"> | string
    title?: StringFilter<"Procedure"> | string
    content?: StringFilter<"Procedure"> | string
    order?: IntFilter<"Procedure"> | number
    department?: XOR<DepartmentRelationFilter, DepartmentWhereInput>
  }, "id">

  export type ProcedureOrderByWithAggregationInput = {
    id?: SortOrder
    departmentId?: SortOrder
    title?: SortOrder
    content?: SortOrder
    order?: SortOrder
    _count?: ProcedureCountOrderByAggregateInput
    _avg?: ProcedureAvgOrderByAggregateInput
    _max?: ProcedureMaxOrderByAggregateInput
    _min?: ProcedureMinOrderByAggregateInput
    _sum?: ProcedureSumOrderByAggregateInput
  }

  export type ProcedureScalarWhereWithAggregatesInput = {
    AND?: ProcedureScalarWhereWithAggregatesInput | ProcedureScalarWhereWithAggregatesInput[]
    OR?: ProcedureScalarWhereWithAggregatesInput[]
    NOT?: ProcedureScalarWhereWithAggregatesInput | ProcedureScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Procedure"> | string
    departmentId?: StringWithAggregatesFilter<"Procedure"> | string
    title?: StringWithAggregatesFilter<"Procedure"> | string
    content?: StringWithAggregatesFilter<"Procedure"> | string
    order?: IntWithAggregatesFilter<"Procedure"> | number
  }

  export type AgentWhereInput = {
    AND?: AgentWhereInput | AgentWhereInput[]
    OR?: AgentWhereInput[]
    NOT?: AgentWhereInput | AgentWhereInput[]
    id?: StringFilter<"Agent"> | string
    name?: StringFilter<"Agent"> | string
    email?: StringFilter<"Agent"> | string
    password?: StringFilter<"Agent"> | string
    role?: StringFilter<"Agent"> | string
    isActive?: BoolFilter<"Agent"> | boolean
    departmentId?: StringNullableFilter<"Agent"> | string | null
    isOnline?: BoolFilter<"Agent"> | boolean
    createdAt?: DateTimeFilter<"Agent"> | Date | string
    department?: XOR<DepartmentNullableRelationFilter, DepartmentWhereInput> | null
    conversations?: ConversationListRelationFilter
    messages?: MessageListRelationFilter
    ownedShortcuts?: ShortcutListRelationFilter
    createdShortcuts?: ShortcutListRelationFilter
    updatedShortcuts?: ShortcutListRelationFilter
    shortcutAudits?: ShortcutAuditListRelationFilter
  }

  export type AgentOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    password?: SortOrder
    role?: SortOrder
    isActive?: SortOrder
    departmentId?: SortOrderInput | SortOrder
    isOnline?: SortOrder
    createdAt?: SortOrder
    department?: DepartmentOrderByWithRelationInput
    conversations?: ConversationOrderByRelationAggregateInput
    messages?: MessageOrderByRelationAggregateInput
    ownedShortcuts?: ShortcutOrderByRelationAggregateInput
    createdShortcuts?: ShortcutOrderByRelationAggregateInput
    updatedShortcuts?: ShortcutOrderByRelationAggregateInput
    shortcutAudits?: ShortcutAuditOrderByRelationAggregateInput
  }

  export type AgentWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    email?: string
    AND?: AgentWhereInput | AgentWhereInput[]
    OR?: AgentWhereInput[]
    NOT?: AgentWhereInput | AgentWhereInput[]
    name?: StringFilter<"Agent"> | string
    password?: StringFilter<"Agent"> | string
    role?: StringFilter<"Agent"> | string
    isActive?: BoolFilter<"Agent"> | boolean
    departmentId?: StringNullableFilter<"Agent"> | string | null
    isOnline?: BoolFilter<"Agent"> | boolean
    createdAt?: DateTimeFilter<"Agent"> | Date | string
    department?: XOR<DepartmentNullableRelationFilter, DepartmentWhereInput> | null
    conversations?: ConversationListRelationFilter
    messages?: MessageListRelationFilter
    ownedShortcuts?: ShortcutListRelationFilter
    createdShortcuts?: ShortcutListRelationFilter
    updatedShortcuts?: ShortcutListRelationFilter
    shortcutAudits?: ShortcutAuditListRelationFilter
  }, "id" | "email">

  export type AgentOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    password?: SortOrder
    role?: SortOrder
    isActive?: SortOrder
    departmentId?: SortOrderInput | SortOrder
    isOnline?: SortOrder
    createdAt?: SortOrder
    _count?: AgentCountOrderByAggregateInput
    _max?: AgentMaxOrderByAggregateInput
    _min?: AgentMinOrderByAggregateInput
  }

  export type AgentScalarWhereWithAggregatesInput = {
    AND?: AgentScalarWhereWithAggregatesInput | AgentScalarWhereWithAggregatesInput[]
    OR?: AgentScalarWhereWithAggregatesInput[]
    NOT?: AgentScalarWhereWithAggregatesInput | AgentScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Agent"> | string
    name?: StringWithAggregatesFilter<"Agent"> | string
    email?: StringWithAggregatesFilter<"Agent"> | string
    password?: StringWithAggregatesFilter<"Agent"> | string
    role?: StringWithAggregatesFilter<"Agent"> | string
    isActive?: BoolWithAggregatesFilter<"Agent"> | boolean
    departmentId?: StringNullableWithAggregatesFilter<"Agent"> | string | null
    isOnline?: BoolWithAggregatesFilter<"Agent"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"Agent"> | Date | string
  }

  export type RolePermissionWhereInput = {
    AND?: RolePermissionWhereInput | RolePermissionWhereInput[]
    OR?: RolePermissionWhereInput[]
    NOT?: RolePermissionWhereInput | RolePermissionWhereInput[]
    id?: StringFilter<"RolePermission"> | string
    role?: StringFilter<"RolePermission"> | string
    resource?: StringFilter<"RolePermission"> | string
    actions?: StringNullableListFilter<"RolePermission">
    updatedAt?: DateTimeFilter<"RolePermission"> | Date | string
  }

  export type RolePermissionOrderByWithRelationInput = {
    id?: SortOrder
    role?: SortOrder
    resource?: SortOrder
    actions?: SortOrder
    updatedAt?: SortOrder
  }

  export type RolePermissionWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    role_resource?: RolePermissionRoleResourceCompoundUniqueInput
    AND?: RolePermissionWhereInput | RolePermissionWhereInput[]
    OR?: RolePermissionWhereInput[]
    NOT?: RolePermissionWhereInput | RolePermissionWhereInput[]
    role?: StringFilter<"RolePermission"> | string
    resource?: StringFilter<"RolePermission"> | string
    actions?: StringNullableListFilter<"RolePermission">
    updatedAt?: DateTimeFilter<"RolePermission"> | Date | string
  }, "id" | "role_resource">

  export type RolePermissionOrderByWithAggregationInput = {
    id?: SortOrder
    role?: SortOrder
    resource?: SortOrder
    actions?: SortOrder
    updatedAt?: SortOrder
    _count?: RolePermissionCountOrderByAggregateInput
    _max?: RolePermissionMaxOrderByAggregateInput
    _min?: RolePermissionMinOrderByAggregateInput
  }

  export type RolePermissionScalarWhereWithAggregatesInput = {
    AND?: RolePermissionScalarWhereWithAggregatesInput | RolePermissionScalarWhereWithAggregatesInput[]
    OR?: RolePermissionScalarWhereWithAggregatesInput[]
    NOT?: RolePermissionScalarWhereWithAggregatesInput | RolePermissionScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"RolePermission"> | string
    role?: StringWithAggregatesFilter<"RolePermission"> | string
    resource?: StringWithAggregatesFilter<"RolePermission"> | string
    actions?: StringNullableListFilter<"RolePermission">
    updatedAt?: DateTimeWithAggregatesFilter<"RolePermission"> | Date | string
  }

  export type ContactWhereInput = {
    AND?: ContactWhereInput | ContactWhereInput[]
    OR?: ContactWhereInput[]
    NOT?: ContactWhereInput | ContactWhereInput[]
    id?: StringFilter<"Contact"> | string
    phone?: StringFilter<"Contact"> | string
    name?: StringFilter<"Contact"> | string
    createdAt?: DateTimeFilter<"Contact"> | Date | string
    conversations?: ConversationListRelationFilter
  }

  export type ContactOrderByWithRelationInput = {
    id?: SortOrder
    phone?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    conversations?: ConversationOrderByRelationAggregateInput
  }

  export type ContactWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    phone?: string
    AND?: ContactWhereInput | ContactWhereInput[]
    OR?: ContactWhereInput[]
    NOT?: ContactWhereInput | ContactWhereInput[]
    name?: StringFilter<"Contact"> | string
    createdAt?: DateTimeFilter<"Contact"> | Date | string
    conversations?: ConversationListRelationFilter
  }, "id" | "phone">

  export type ContactOrderByWithAggregationInput = {
    id?: SortOrder
    phone?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    _count?: ContactCountOrderByAggregateInput
    _max?: ContactMaxOrderByAggregateInput
    _min?: ContactMinOrderByAggregateInput
  }

  export type ContactScalarWhereWithAggregatesInput = {
    AND?: ContactScalarWhereWithAggregatesInput | ContactScalarWhereWithAggregatesInput[]
    OR?: ContactScalarWhereWithAggregatesInput[]
    NOT?: ContactScalarWhereWithAggregatesInput | ContactScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Contact"> | string
    phone?: StringWithAggregatesFilter<"Contact"> | string
    name?: StringWithAggregatesFilter<"Contact"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Contact"> | Date | string
  }

  export type ConversationWhereInput = {
    AND?: ConversationWhereInput | ConversationWhereInput[]
    OR?: ConversationWhereInput[]
    NOT?: ConversationWhereInput | ConversationWhereInput[]
    id?: StringFilter<"Conversation"> | string
    contactId?: StringFilter<"Conversation"> | string
    status?: StringFilter<"Conversation"> | string
    departmentId?: StringNullableFilter<"Conversation"> | string | null
    assignedAgentId?: StringNullableFilter<"Conversation"> | string | null
    currentStep?: StringNullableFilter<"Conversation"> | string | null
    startedAt?: DateTimeFilter<"Conversation"> | Date | string
    closedAt?: DateTimeNullableFilter<"Conversation"> | Date | string | null
    contact?: XOR<ContactRelationFilter, ContactWhereInput>
    department?: XOR<DepartmentNullableRelationFilter, DepartmentWhereInput> | null
    assignedAgent?: XOR<AgentNullableRelationFilter, AgentWhereInput> | null
    messages?: MessageListRelationFilter
  }

  export type ConversationOrderByWithRelationInput = {
    id?: SortOrder
    contactId?: SortOrder
    status?: SortOrder
    departmentId?: SortOrderInput | SortOrder
    assignedAgentId?: SortOrderInput | SortOrder
    currentStep?: SortOrderInput | SortOrder
    startedAt?: SortOrder
    closedAt?: SortOrderInput | SortOrder
    contact?: ContactOrderByWithRelationInput
    department?: DepartmentOrderByWithRelationInput
    assignedAgent?: AgentOrderByWithRelationInput
    messages?: MessageOrderByRelationAggregateInput
  }

  export type ConversationWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ConversationWhereInput | ConversationWhereInput[]
    OR?: ConversationWhereInput[]
    NOT?: ConversationWhereInput | ConversationWhereInput[]
    contactId?: StringFilter<"Conversation"> | string
    status?: StringFilter<"Conversation"> | string
    departmentId?: StringNullableFilter<"Conversation"> | string | null
    assignedAgentId?: StringNullableFilter<"Conversation"> | string | null
    currentStep?: StringNullableFilter<"Conversation"> | string | null
    startedAt?: DateTimeFilter<"Conversation"> | Date | string
    closedAt?: DateTimeNullableFilter<"Conversation"> | Date | string | null
    contact?: XOR<ContactRelationFilter, ContactWhereInput>
    department?: XOR<DepartmentNullableRelationFilter, DepartmentWhereInput> | null
    assignedAgent?: XOR<AgentNullableRelationFilter, AgentWhereInput> | null
    messages?: MessageListRelationFilter
  }, "id">

  export type ConversationOrderByWithAggregationInput = {
    id?: SortOrder
    contactId?: SortOrder
    status?: SortOrder
    departmentId?: SortOrderInput | SortOrder
    assignedAgentId?: SortOrderInput | SortOrder
    currentStep?: SortOrderInput | SortOrder
    startedAt?: SortOrder
    closedAt?: SortOrderInput | SortOrder
    _count?: ConversationCountOrderByAggregateInput
    _max?: ConversationMaxOrderByAggregateInput
    _min?: ConversationMinOrderByAggregateInput
  }

  export type ConversationScalarWhereWithAggregatesInput = {
    AND?: ConversationScalarWhereWithAggregatesInput | ConversationScalarWhereWithAggregatesInput[]
    OR?: ConversationScalarWhereWithAggregatesInput[]
    NOT?: ConversationScalarWhereWithAggregatesInput | ConversationScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Conversation"> | string
    contactId?: StringWithAggregatesFilter<"Conversation"> | string
    status?: StringWithAggregatesFilter<"Conversation"> | string
    departmentId?: StringNullableWithAggregatesFilter<"Conversation"> | string | null
    assignedAgentId?: StringNullableWithAggregatesFilter<"Conversation"> | string | null
    currentStep?: StringNullableWithAggregatesFilter<"Conversation"> | string | null
    startedAt?: DateTimeWithAggregatesFilter<"Conversation"> | Date | string
    closedAt?: DateTimeNullableWithAggregatesFilter<"Conversation"> | Date | string | null
  }

  export type MessageWhereInput = {
    AND?: MessageWhereInput | MessageWhereInput[]
    OR?: MessageWhereInput[]
    NOT?: MessageWhereInput | MessageWhereInput[]
    id?: StringFilter<"Message"> | string
    conversationId?: StringFilter<"Message"> | string
    direction?: StringFilter<"Message"> | string
    senderType?: StringFilter<"Message"> | string
    senderAgentId?: StringNullableFilter<"Message"> | string | null
    content?: StringFilter<"Message"> | string
    createdAt?: DateTimeFilter<"Message"> | Date | string
    readAt?: DateTimeNullableFilter<"Message"> | Date | string | null
    conversation?: XOR<ConversationRelationFilter, ConversationWhereInput>
    senderAgent?: XOR<AgentNullableRelationFilter, AgentWhereInput> | null
  }

  export type MessageOrderByWithRelationInput = {
    id?: SortOrder
    conversationId?: SortOrder
    direction?: SortOrder
    senderType?: SortOrder
    senderAgentId?: SortOrderInput | SortOrder
    content?: SortOrder
    createdAt?: SortOrder
    readAt?: SortOrderInput | SortOrder
    conversation?: ConversationOrderByWithRelationInput
    senderAgent?: AgentOrderByWithRelationInput
  }

  export type MessageWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: MessageWhereInput | MessageWhereInput[]
    OR?: MessageWhereInput[]
    NOT?: MessageWhereInput | MessageWhereInput[]
    conversationId?: StringFilter<"Message"> | string
    direction?: StringFilter<"Message"> | string
    senderType?: StringFilter<"Message"> | string
    senderAgentId?: StringNullableFilter<"Message"> | string | null
    content?: StringFilter<"Message"> | string
    createdAt?: DateTimeFilter<"Message"> | Date | string
    readAt?: DateTimeNullableFilter<"Message"> | Date | string | null
    conversation?: XOR<ConversationRelationFilter, ConversationWhereInput>
    senderAgent?: XOR<AgentNullableRelationFilter, AgentWhereInput> | null
  }, "id">

  export type MessageOrderByWithAggregationInput = {
    id?: SortOrder
    conversationId?: SortOrder
    direction?: SortOrder
    senderType?: SortOrder
    senderAgentId?: SortOrderInput | SortOrder
    content?: SortOrder
    createdAt?: SortOrder
    readAt?: SortOrderInput | SortOrder
    _count?: MessageCountOrderByAggregateInput
    _max?: MessageMaxOrderByAggregateInput
    _min?: MessageMinOrderByAggregateInput
  }

  export type MessageScalarWhereWithAggregatesInput = {
    AND?: MessageScalarWhereWithAggregatesInput | MessageScalarWhereWithAggregatesInput[]
    OR?: MessageScalarWhereWithAggregatesInput[]
    NOT?: MessageScalarWhereWithAggregatesInput | MessageScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Message"> | string
    conversationId?: StringWithAggregatesFilter<"Message"> | string
    direction?: StringWithAggregatesFilter<"Message"> | string
    senderType?: StringWithAggregatesFilter<"Message"> | string
    senderAgentId?: StringNullableWithAggregatesFilter<"Message"> | string | null
    content?: StringWithAggregatesFilter<"Message"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Message"> | Date | string
    readAt?: DateTimeNullableWithAggregatesFilter<"Message"> | Date | string | null
  }

  export type FlowDefinitionWhereInput = {
    AND?: FlowDefinitionWhereInput | FlowDefinitionWhereInput[]
    OR?: FlowDefinitionWhereInput[]
    NOT?: FlowDefinitionWhereInput | FlowDefinitionWhereInput[]
    id?: StringFilter<"FlowDefinition"> | string
    name?: StringFilter<"FlowDefinition"> | string
    greeting?: StringFilter<"FlowDefinition"> | string
    menuMessage?: StringFilter<"FlowDefinition"> | string
    options?: JsonFilter<"FlowDefinition">
    updatedAt?: DateTimeFilter<"FlowDefinition"> | Date | string
  }

  export type FlowDefinitionOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    greeting?: SortOrder
    menuMessage?: SortOrder
    options?: SortOrder
    updatedAt?: SortOrder
  }

  export type FlowDefinitionWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: FlowDefinitionWhereInput | FlowDefinitionWhereInput[]
    OR?: FlowDefinitionWhereInput[]
    NOT?: FlowDefinitionWhereInput | FlowDefinitionWhereInput[]
    name?: StringFilter<"FlowDefinition"> | string
    greeting?: StringFilter<"FlowDefinition"> | string
    menuMessage?: StringFilter<"FlowDefinition"> | string
    options?: JsonFilter<"FlowDefinition">
    updatedAt?: DateTimeFilter<"FlowDefinition"> | Date | string
  }, "id">

  export type FlowDefinitionOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    greeting?: SortOrder
    menuMessage?: SortOrder
    options?: SortOrder
    updatedAt?: SortOrder
    _count?: FlowDefinitionCountOrderByAggregateInput
    _max?: FlowDefinitionMaxOrderByAggregateInput
    _min?: FlowDefinitionMinOrderByAggregateInput
  }

  export type FlowDefinitionScalarWhereWithAggregatesInput = {
    AND?: FlowDefinitionScalarWhereWithAggregatesInput | FlowDefinitionScalarWhereWithAggregatesInput[]
    OR?: FlowDefinitionScalarWhereWithAggregatesInput[]
    NOT?: FlowDefinitionScalarWhereWithAggregatesInput | FlowDefinitionScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"FlowDefinition"> | string
    name?: StringWithAggregatesFilter<"FlowDefinition"> | string
    greeting?: StringWithAggregatesFilter<"FlowDefinition"> | string
    menuMessage?: StringWithAggregatesFilter<"FlowDefinition"> | string
    options?: JsonWithAggregatesFilter<"FlowDefinition">
    updatedAt?: DateTimeWithAggregatesFilter<"FlowDefinition"> | Date | string
  }

  export type ZApiConfigWhereInput = {
    AND?: ZApiConfigWhereInput | ZApiConfigWhereInput[]
    OR?: ZApiConfigWhereInput[]
    NOT?: ZApiConfigWhereInput | ZApiConfigWhereInput[]
    id?: StringFilter<"ZApiConfig"> | string
    instanceId?: StringFilter<"ZApiConfig"> | string
    token?: StringFilter<"ZApiConfig"> | string
    clientToken?: StringNullableFilter<"ZApiConfig"> | string | null
    webhookUrl?: StringNullableFilter<"ZApiConfig"> | string | null
    isActive?: BoolFilter<"ZApiConfig"> | boolean
    autoReply?: BoolFilter<"ZApiConfig"> | boolean
    updatedAt?: DateTimeFilter<"ZApiConfig"> | Date | string
  }

  export type ZApiConfigOrderByWithRelationInput = {
    id?: SortOrder
    instanceId?: SortOrder
    token?: SortOrder
    clientToken?: SortOrderInput | SortOrder
    webhookUrl?: SortOrderInput | SortOrder
    isActive?: SortOrder
    autoReply?: SortOrder
    updatedAt?: SortOrder
  }

  export type ZApiConfigWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ZApiConfigWhereInput | ZApiConfigWhereInput[]
    OR?: ZApiConfigWhereInput[]
    NOT?: ZApiConfigWhereInput | ZApiConfigWhereInput[]
    instanceId?: StringFilter<"ZApiConfig"> | string
    token?: StringFilter<"ZApiConfig"> | string
    clientToken?: StringNullableFilter<"ZApiConfig"> | string | null
    webhookUrl?: StringNullableFilter<"ZApiConfig"> | string | null
    isActive?: BoolFilter<"ZApiConfig"> | boolean
    autoReply?: BoolFilter<"ZApiConfig"> | boolean
    updatedAt?: DateTimeFilter<"ZApiConfig"> | Date | string
  }, "id">

  export type ZApiConfigOrderByWithAggregationInput = {
    id?: SortOrder
    instanceId?: SortOrder
    token?: SortOrder
    clientToken?: SortOrderInput | SortOrder
    webhookUrl?: SortOrderInput | SortOrder
    isActive?: SortOrder
    autoReply?: SortOrder
    updatedAt?: SortOrder
    _count?: ZApiConfigCountOrderByAggregateInput
    _max?: ZApiConfigMaxOrderByAggregateInput
    _min?: ZApiConfigMinOrderByAggregateInput
  }

  export type ZApiConfigScalarWhereWithAggregatesInput = {
    AND?: ZApiConfigScalarWhereWithAggregatesInput | ZApiConfigScalarWhereWithAggregatesInput[]
    OR?: ZApiConfigScalarWhereWithAggregatesInput[]
    NOT?: ZApiConfigScalarWhereWithAggregatesInput | ZApiConfigScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ZApiConfig"> | string
    instanceId?: StringWithAggregatesFilter<"ZApiConfig"> | string
    token?: StringWithAggregatesFilter<"ZApiConfig"> | string
    clientToken?: StringNullableWithAggregatesFilter<"ZApiConfig"> | string | null
    webhookUrl?: StringNullableWithAggregatesFilter<"ZApiConfig"> | string | null
    isActive?: BoolWithAggregatesFilter<"ZApiConfig"> | boolean
    autoReply?: BoolWithAggregatesFilter<"ZApiConfig"> | boolean
    updatedAt?: DateTimeWithAggregatesFilter<"ZApiConfig"> | Date | string
  }

  export type ShortcutWhereInput = {
    AND?: ShortcutWhereInput | ShortcutWhereInput[]
    OR?: ShortcutWhereInput[]
    NOT?: ShortcutWhereInput | ShortcutWhereInput[]
    id?: StringFilter<"Shortcut"> | string
    title?: StringFilter<"Shortcut"> | string
    message?: StringFilter<"Shortcut"> | string
    type?: EnumShortcutTypeFilter<"Shortcut"> | $Enums.ShortcutType
    scope?: EnumShortcutScopeFilter<"Shortcut"> | $Enums.ShortcutScope
    departmentId?: StringNullableFilter<"Shortcut"> | string | null
    ownerId?: StringNullableFilter<"Shortcut"> | string | null
    isActive?: BoolFilter<"Shortcut"> | boolean
    sortOrder?: IntFilter<"Shortcut"> | number
    createdById?: StringFilter<"Shortcut"> | string
    updatedById?: StringNullableFilter<"Shortcut"> | string | null
    createdAt?: DateTimeFilter<"Shortcut"> | Date | string
    updatedAt?: DateTimeFilter<"Shortcut"> | Date | string
    archivedAt?: DateTimeNullableFilter<"Shortcut"> | Date | string | null
    department?: XOR<DepartmentNullableRelationFilter, DepartmentWhereInput> | null
    owner?: XOR<AgentNullableRelationFilter, AgentWhereInput> | null
    createdBy?: XOR<AgentRelationFilter, AgentWhereInput>
    updatedBy?: XOR<AgentNullableRelationFilter, AgentWhereInput> | null
    audits?: ShortcutAuditListRelationFilter
  }

  export type ShortcutOrderByWithRelationInput = {
    id?: SortOrder
    title?: SortOrder
    message?: SortOrder
    type?: SortOrder
    scope?: SortOrder
    departmentId?: SortOrderInput | SortOrder
    ownerId?: SortOrderInput | SortOrder
    isActive?: SortOrder
    sortOrder?: SortOrder
    createdById?: SortOrder
    updatedById?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    archivedAt?: SortOrderInput | SortOrder
    department?: DepartmentOrderByWithRelationInput
    owner?: AgentOrderByWithRelationInput
    createdBy?: AgentOrderByWithRelationInput
    updatedBy?: AgentOrderByWithRelationInput
    audits?: ShortcutAuditOrderByRelationAggregateInput
  }

  export type ShortcutWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ShortcutWhereInput | ShortcutWhereInput[]
    OR?: ShortcutWhereInput[]
    NOT?: ShortcutWhereInput | ShortcutWhereInput[]
    title?: StringFilter<"Shortcut"> | string
    message?: StringFilter<"Shortcut"> | string
    type?: EnumShortcutTypeFilter<"Shortcut"> | $Enums.ShortcutType
    scope?: EnumShortcutScopeFilter<"Shortcut"> | $Enums.ShortcutScope
    departmentId?: StringNullableFilter<"Shortcut"> | string | null
    ownerId?: StringNullableFilter<"Shortcut"> | string | null
    isActive?: BoolFilter<"Shortcut"> | boolean
    sortOrder?: IntFilter<"Shortcut"> | number
    createdById?: StringFilter<"Shortcut"> | string
    updatedById?: StringNullableFilter<"Shortcut"> | string | null
    createdAt?: DateTimeFilter<"Shortcut"> | Date | string
    updatedAt?: DateTimeFilter<"Shortcut"> | Date | string
    archivedAt?: DateTimeNullableFilter<"Shortcut"> | Date | string | null
    department?: XOR<DepartmentNullableRelationFilter, DepartmentWhereInput> | null
    owner?: XOR<AgentNullableRelationFilter, AgentWhereInput> | null
    createdBy?: XOR<AgentRelationFilter, AgentWhereInput>
    updatedBy?: XOR<AgentNullableRelationFilter, AgentWhereInput> | null
    audits?: ShortcutAuditListRelationFilter
  }, "id">

  export type ShortcutOrderByWithAggregationInput = {
    id?: SortOrder
    title?: SortOrder
    message?: SortOrder
    type?: SortOrder
    scope?: SortOrder
    departmentId?: SortOrderInput | SortOrder
    ownerId?: SortOrderInput | SortOrder
    isActive?: SortOrder
    sortOrder?: SortOrder
    createdById?: SortOrder
    updatedById?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    archivedAt?: SortOrderInput | SortOrder
    _count?: ShortcutCountOrderByAggregateInput
    _avg?: ShortcutAvgOrderByAggregateInput
    _max?: ShortcutMaxOrderByAggregateInput
    _min?: ShortcutMinOrderByAggregateInput
    _sum?: ShortcutSumOrderByAggregateInput
  }

  export type ShortcutScalarWhereWithAggregatesInput = {
    AND?: ShortcutScalarWhereWithAggregatesInput | ShortcutScalarWhereWithAggregatesInput[]
    OR?: ShortcutScalarWhereWithAggregatesInput[]
    NOT?: ShortcutScalarWhereWithAggregatesInput | ShortcutScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Shortcut"> | string
    title?: StringWithAggregatesFilter<"Shortcut"> | string
    message?: StringWithAggregatesFilter<"Shortcut"> | string
    type?: EnumShortcutTypeWithAggregatesFilter<"Shortcut"> | $Enums.ShortcutType
    scope?: EnumShortcutScopeWithAggregatesFilter<"Shortcut"> | $Enums.ShortcutScope
    departmentId?: StringNullableWithAggregatesFilter<"Shortcut"> | string | null
    ownerId?: StringNullableWithAggregatesFilter<"Shortcut"> | string | null
    isActive?: BoolWithAggregatesFilter<"Shortcut"> | boolean
    sortOrder?: IntWithAggregatesFilter<"Shortcut"> | number
    createdById?: StringWithAggregatesFilter<"Shortcut"> | string
    updatedById?: StringNullableWithAggregatesFilter<"Shortcut"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Shortcut"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Shortcut"> | Date | string
    archivedAt?: DateTimeNullableWithAggregatesFilter<"Shortcut"> | Date | string | null
  }

  export type ShortcutAuditWhereInput = {
    AND?: ShortcutAuditWhereInput | ShortcutAuditWhereInput[]
    OR?: ShortcutAuditWhereInput[]
    NOT?: ShortcutAuditWhereInput | ShortcutAuditWhereInput[]
    id?: StringFilter<"ShortcutAudit"> | string
    shortcutId?: StringNullableFilter<"ShortcutAudit"> | string | null
    actorId?: StringFilter<"ShortcutAudit"> | string
    action?: StringFilter<"ShortcutAudit"> | string
    metadata?: JsonNullableFilter<"ShortcutAudit">
    createdAt?: DateTimeFilter<"ShortcutAudit"> | Date | string
    shortcut?: XOR<ShortcutNullableRelationFilter, ShortcutWhereInput> | null
    actor?: XOR<AgentRelationFilter, AgentWhereInput>
  }

  export type ShortcutAuditOrderByWithRelationInput = {
    id?: SortOrder
    shortcutId?: SortOrderInput | SortOrder
    actorId?: SortOrder
    action?: SortOrder
    metadata?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    shortcut?: ShortcutOrderByWithRelationInput
    actor?: AgentOrderByWithRelationInput
  }

  export type ShortcutAuditWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ShortcutAuditWhereInput | ShortcutAuditWhereInput[]
    OR?: ShortcutAuditWhereInput[]
    NOT?: ShortcutAuditWhereInput | ShortcutAuditWhereInput[]
    shortcutId?: StringNullableFilter<"ShortcutAudit"> | string | null
    actorId?: StringFilter<"ShortcutAudit"> | string
    action?: StringFilter<"ShortcutAudit"> | string
    metadata?: JsonNullableFilter<"ShortcutAudit">
    createdAt?: DateTimeFilter<"ShortcutAudit"> | Date | string
    shortcut?: XOR<ShortcutNullableRelationFilter, ShortcutWhereInput> | null
    actor?: XOR<AgentRelationFilter, AgentWhereInput>
  }, "id">

  export type ShortcutAuditOrderByWithAggregationInput = {
    id?: SortOrder
    shortcutId?: SortOrderInput | SortOrder
    actorId?: SortOrder
    action?: SortOrder
    metadata?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: ShortcutAuditCountOrderByAggregateInput
    _max?: ShortcutAuditMaxOrderByAggregateInput
    _min?: ShortcutAuditMinOrderByAggregateInput
  }

  export type ShortcutAuditScalarWhereWithAggregatesInput = {
    AND?: ShortcutAuditScalarWhereWithAggregatesInput | ShortcutAuditScalarWhereWithAggregatesInput[]
    OR?: ShortcutAuditScalarWhereWithAggregatesInput[]
    NOT?: ShortcutAuditScalarWhereWithAggregatesInput | ShortcutAuditScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ShortcutAudit"> | string
    shortcutId?: StringNullableWithAggregatesFilter<"ShortcutAudit"> | string | null
    actorId?: StringWithAggregatesFilter<"ShortcutAudit"> | string
    action?: StringWithAggregatesFilter<"ShortcutAudit"> | string
    metadata?: JsonNullableWithAggregatesFilter<"ShortcutAudit">
    createdAt?: DateTimeWithAggregatesFilter<"ShortcutAudit"> | Date | string
  }

  export type DepartmentCreateInput = {
    id?: string
    name: string
    description?: string | null
    createdAt?: Date | string
    procedures?: ProcedureCreateNestedManyWithoutDepartmentInput
    agents?: AgentCreateNestedManyWithoutDepartmentInput
    conversations?: ConversationCreateNestedManyWithoutDepartmentInput
    shortcuts?: ShortcutCreateNestedManyWithoutDepartmentInput
  }

  export type DepartmentUncheckedCreateInput = {
    id?: string
    name: string
    description?: string | null
    createdAt?: Date | string
    procedures?: ProcedureUncheckedCreateNestedManyWithoutDepartmentInput
    agents?: AgentUncheckedCreateNestedManyWithoutDepartmentInput
    conversations?: ConversationUncheckedCreateNestedManyWithoutDepartmentInput
    shortcuts?: ShortcutUncheckedCreateNestedManyWithoutDepartmentInput
  }

  export type DepartmentUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    procedures?: ProcedureUpdateManyWithoutDepartmentNestedInput
    agents?: AgentUpdateManyWithoutDepartmentNestedInput
    conversations?: ConversationUpdateManyWithoutDepartmentNestedInput
    shortcuts?: ShortcutUpdateManyWithoutDepartmentNestedInput
  }

  export type DepartmentUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    procedures?: ProcedureUncheckedUpdateManyWithoutDepartmentNestedInput
    agents?: AgentUncheckedUpdateManyWithoutDepartmentNestedInput
    conversations?: ConversationUncheckedUpdateManyWithoutDepartmentNestedInput
    shortcuts?: ShortcutUncheckedUpdateManyWithoutDepartmentNestedInput
  }

  export type DepartmentCreateManyInput = {
    id?: string
    name: string
    description?: string | null
    createdAt?: Date | string
  }

  export type DepartmentUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DepartmentUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProcedureCreateInput = {
    id?: string
    title: string
    content: string
    order?: number
    department: DepartmentCreateNestedOneWithoutProceduresInput
  }

  export type ProcedureUncheckedCreateInput = {
    id?: string
    departmentId: string
    title: string
    content: string
    order?: number
  }

  export type ProcedureUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    order?: IntFieldUpdateOperationsInput | number
    department?: DepartmentUpdateOneRequiredWithoutProceduresNestedInput
  }

  export type ProcedureUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    departmentId?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    order?: IntFieldUpdateOperationsInput | number
  }

  export type ProcedureCreateManyInput = {
    id?: string
    departmentId: string
    title: string
    content: string
    order?: number
  }

  export type ProcedureUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    order?: IntFieldUpdateOperationsInput | number
  }

  export type ProcedureUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    departmentId?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    order?: IntFieldUpdateOperationsInput | number
  }

  export type AgentCreateInput = {
    id?: string
    name: string
    email: string
    password?: string
    role?: string
    isActive?: boolean
    isOnline?: boolean
    createdAt?: Date | string
    department?: DepartmentCreateNestedOneWithoutAgentsInput
    conversations?: ConversationCreateNestedManyWithoutAssignedAgentInput
    messages?: MessageCreateNestedManyWithoutSenderAgentInput
    ownedShortcuts?: ShortcutCreateNestedManyWithoutOwnerInput
    createdShortcuts?: ShortcutCreateNestedManyWithoutCreatedByInput
    updatedShortcuts?: ShortcutCreateNestedManyWithoutUpdatedByInput
    shortcutAudits?: ShortcutAuditCreateNestedManyWithoutActorInput
  }

  export type AgentUncheckedCreateInput = {
    id?: string
    name: string
    email: string
    password?: string
    role?: string
    isActive?: boolean
    departmentId?: string | null
    isOnline?: boolean
    createdAt?: Date | string
    conversations?: ConversationUncheckedCreateNestedManyWithoutAssignedAgentInput
    messages?: MessageUncheckedCreateNestedManyWithoutSenderAgentInput
    ownedShortcuts?: ShortcutUncheckedCreateNestedManyWithoutOwnerInput
    createdShortcuts?: ShortcutUncheckedCreateNestedManyWithoutCreatedByInput
    updatedShortcuts?: ShortcutUncheckedCreateNestedManyWithoutUpdatedByInput
    shortcutAudits?: ShortcutAuditUncheckedCreateNestedManyWithoutActorInput
  }

  export type AgentUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    isOnline?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    department?: DepartmentUpdateOneWithoutAgentsNestedInput
    conversations?: ConversationUpdateManyWithoutAssignedAgentNestedInput
    messages?: MessageUpdateManyWithoutSenderAgentNestedInput
    ownedShortcuts?: ShortcutUpdateManyWithoutOwnerNestedInput
    createdShortcuts?: ShortcutUpdateManyWithoutCreatedByNestedInput
    updatedShortcuts?: ShortcutUpdateManyWithoutUpdatedByNestedInput
    shortcutAudits?: ShortcutAuditUpdateManyWithoutActorNestedInput
  }

  export type AgentUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    departmentId?: NullableStringFieldUpdateOperationsInput | string | null
    isOnline?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    conversations?: ConversationUncheckedUpdateManyWithoutAssignedAgentNestedInput
    messages?: MessageUncheckedUpdateManyWithoutSenderAgentNestedInput
    ownedShortcuts?: ShortcutUncheckedUpdateManyWithoutOwnerNestedInput
    createdShortcuts?: ShortcutUncheckedUpdateManyWithoutCreatedByNestedInput
    updatedShortcuts?: ShortcutUncheckedUpdateManyWithoutUpdatedByNestedInput
    shortcutAudits?: ShortcutAuditUncheckedUpdateManyWithoutActorNestedInput
  }

  export type AgentCreateManyInput = {
    id?: string
    name: string
    email: string
    password?: string
    role?: string
    isActive?: boolean
    departmentId?: string | null
    isOnline?: boolean
    createdAt?: Date | string
  }

  export type AgentUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    isOnline?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AgentUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    departmentId?: NullableStringFieldUpdateOperationsInput | string | null
    isOnline?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RolePermissionCreateInput = {
    id?: string
    role: string
    resource: string
    actions?: RolePermissionCreateactionsInput | string[]
    updatedAt?: Date | string
  }

  export type RolePermissionUncheckedCreateInput = {
    id?: string
    role: string
    resource: string
    actions?: RolePermissionCreateactionsInput | string[]
    updatedAt?: Date | string
  }

  export type RolePermissionUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    resource?: StringFieldUpdateOperationsInput | string
    actions?: RolePermissionUpdateactionsInput | string[]
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RolePermissionUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    resource?: StringFieldUpdateOperationsInput | string
    actions?: RolePermissionUpdateactionsInput | string[]
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RolePermissionCreateManyInput = {
    id?: string
    role: string
    resource: string
    actions?: RolePermissionCreateactionsInput | string[]
    updatedAt?: Date | string
  }

  export type RolePermissionUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    resource?: StringFieldUpdateOperationsInput | string
    actions?: RolePermissionUpdateactionsInput | string[]
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RolePermissionUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    resource?: StringFieldUpdateOperationsInput | string
    actions?: RolePermissionUpdateactionsInput | string[]
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ContactCreateInput = {
    id?: string
    phone: string
    name: string
    createdAt?: Date | string
    conversations?: ConversationCreateNestedManyWithoutContactInput
  }

  export type ContactUncheckedCreateInput = {
    id?: string
    phone: string
    name: string
    createdAt?: Date | string
    conversations?: ConversationUncheckedCreateNestedManyWithoutContactInput
  }

  export type ContactUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    conversations?: ConversationUpdateManyWithoutContactNestedInput
  }

  export type ContactUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    conversations?: ConversationUncheckedUpdateManyWithoutContactNestedInput
  }

  export type ContactCreateManyInput = {
    id?: string
    phone: string
    name: string
    createdAt?: Date | string
  }

  export type ContactUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ContactUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ConversationCreateInput = {
    id?: string
    status?: string
    currentStep?: string | null
    startedAt?: Date | string
    closedAt?: Date | string | null
    contact: ContactCreateNestedOneWithoutConversationsInput
    department?: DepartmentCreateNestedOneWithoutConversationsInput
    assignedAgent?: AgentCreateNestedOneWithoutConversationsInput
    messages?: MessageCreateNestedManyWithoutConversationInput
  }

  export type ConversationUncheckedCreateInput = {
    id?: string
    contactId: string
    status?: string
    departmentId?: string | null
    assignedAgentId?: string | null
    currentStep?: string | null
    startedAt?: Date | string
    closedAt?: Date | string | null
    messages?: MessageUncheckedCreateNestedManyWithoutConversationInput
  }

  export type ConversationUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    currentStep?: NullableStringFieldUpdateOperationsInput | string | null
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    closedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    contact?: ContactUpdateOneRequiredWithoutConversationsNestedInput
    department?: DepartmentUpdateOneWithoutConversationsNestedInput
    assignedAgent?: AgentUpdateOneWithoutConversationsNestedInput
    messages?: MessageUpdateManyWithoutConversationNestedInput
  }

  export type ConversationUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    contactId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    departmentId?: NullableStringFieldUpdateOperationsInput | string | null
    assignedAgentId?: NullableStringFieldUpdateOperationsInput | string | null
    currentStep?: NullableStringFieldUpdateOperationsInput | string | null
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    closedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    messages?: MessageUncheckedUpdateManyWithoutConversationNestedInput
  }

  export type ConversationCreateManyInput = {
    id?: string
    contactId: string
    status?: string
    departmentId?: string | null
    assignedAgentId?: string | null
    currentStep?: string | null
    startedAt?: Date | string
    closedAt?: Date | string | null
  }

  export type ConversationUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    currentStep?: NullableStringFieldUpdateOperationsInput | string | null
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    closedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type ConversationUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    contactId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    departmentId?: NullableStringFieldUpdateOperationsInput | string | null
    assignedAgentId?: NullableStringFieldUpdateOperationsInput | string | null
    currentStep?: NullableStringFieldUpdateOperationsInput | string | null
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    closedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type MessageCreateInput = {
    id?: string
    direction: string
    senderType: string
    content: string
    createdAt?: Date | string
    readAt?: Date | string | null
    conversation: ConversationCreateNestedOneWithoutMessagesInput
    senderAgent?: AgentCreateNestedOneWithoutMessagesInput
  }

  export type MessageUncheckedCreateInput = {
    id?: string
    conversationId: string
    direction: string
    senderType: string
    senderAgentId?: string | null
    content: string
    createdAt?: Date | string
    readAt?: Date | string | null
  }

  export type MessageUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    direction?: StringFieldUpdateOperationsInput | string
    senderType?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    readAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    conversation?: ConversationUpdateOneRequiredWithoutMessagesNestedInput
    senderAgent?: AgentUpdateOneWithoutMessagesNestedInput
  }

  export type MessageUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    conversationId?: StringFieldUpdateOperationsInput | string
    direction?: StringFieldUpdateOperationsInput | string
    senderType?: StringFieldUpdateOperationsInput | string
    senderAgentId?: NullableStringFieldUpdateOperationsInput | string | null
    content?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    readAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type MessageCreateManyInput = {
    id?: string
    conversationId: string
    direction: string
    senderType: string
    senderAgentId?: string | null
    content: string
    createdAt?: Date | string
    readAt?: Date | string | null
  }

  export type MessageUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    direction?: StringFieldUpdateOperationsInput | string
    senderType?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    readAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type MessageUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    conversationId?: StringFieldUpdateOperationsInput | string
    direction?: StringFieldUpdateOperationsInput | string
    senderType?: StringFieldUpdateOperationsInput | string
    senderAgentId?: NullableStringFieldUpdateOperationsInput | string | null
    content?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    readAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type FlowDefinitionCreateInput = {
    id?: string
    name: string
    greeting: string
    menuMessage: string
    options: JsonNullValueInput | InputJsonValue
    updatedAt?: Date | string
  }

  export type FlowDefinitionUncheckedCreateInput = {
    id?: string
    name: string
    greeting: string
    menuMessage: string
    options: JsonNullValueInput | InputJsonValue
    updatedAt?: Date | string
  }

  export type FlowDefinitionUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    greeting?: StringFieldUpdateOperationsInput | string
    menuMessage?: StringFieldUpdateOperationsInput | string
    options?: JsonNullValueInput | InputJsonValue
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FlowDefinitionUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    greeting?: StringFieldUpdateOperationsInput | string
    menuMessage?: StringFieldUpdateOperationsInput | string
    options?: JsonNullValueInput | InputJsonValue
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FlowDefinitionCreateManyInput = {
    id?: string
    name: string
    greeting: string
    menuMessage: string
    options: JsonNullValueInput | InputJsonValue
    updatedAt?: Date | string
  }

  export type FlowDefinitionUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    greeting?: StringFieldUpdateOperationsInput | string
    menuMessage?: StringFieldUpdateOperationsInput | string
    options?: JsonNullValueInput | InputJsonValue
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FlowDefinitionUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    greeting?: StringFieldUpdateOperationsInput | string
    menuMessage?: StringFieldUpdateOperationsInput | string
    options?: JsonNullValueInput | InputJsonValue
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ZApiConfigCreateInput = {
    id?: string
    instanceId: string
    token: string
    clientToken?: string | null
    webhookUrl?: string | null
    isActive?: boolean
    autoReply?: boolean
    updatedAt?: Date | string
  }

  export type ZApiConfigUncheckedCreateInput = {
    id?: string
    instanceId: string
    token: string
    clientToken?: string | null
    webhookUrl?: string | null
    isActive?: boolean
    autoReply?: boolean
    updatedAt?: Date | string
  }

  export type ZApiConfigUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    instanceId?: StringFieldUpdateOperationsInput | string
    token?: StringFieldUpdateOperationsInput | string
    clientToken?: NullableStringFieldUpdateOperationsInput | string | null
    webhookUrl?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    autoReply?: BoolFieldUpdateOperationsInput | boolean
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ZApiConfigUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    instanceId?: StringFieldUpdateOperationsInput | string
    token?: StringFieldUpdateOperationsInput | string
    clientToken?: NullableStringFieldUpdateOperationsInput | string | null
    webhookUrl?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    autoReply?: BoolFieldUpdateOperationsInput | boolean
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ZApiConfigCreateManyInput = {
    id?: string
    instanceId: string
    token: string
    clientToken?: string | null
    webhookUrl?: string | null
    isActive?: boolean
    autoReply?: boolean
    updatedAt?: Date | string
  }

  export type ZApiConfigUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    instanceId?: StringFieldUpdateOperationsInput | string
    token?: StringFieldUpdateOperationsInput | string
    clientToken?: NullableStringFieldUpdateOperationsInput | string | null
    webhookUrl?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    autoReply?: BoolFieldUpdateOperationsInput | boolean
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ZApiConfigUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    instanceId?: StringFieldUpdateOperationsInput | string
    token?: StringFieldUpdateOperationsInput | string
    clientToken?: NullableStringFieldUpdateOperationsInput | string | null
    webhookUrl?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    autoReply?: BoolFieldUpdateOperationsInput | boolean
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ShortcutCreateInput = {
    id?: string
    title: string
    message: string
    type: $Enums.ShortcutType
    scope: $Enums.ShortcutScope
    isActive?: boolean
    sortOrder?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    archivedAt?: Date | string | null
    department?: DepartmentCreateNestedOneWithoutShortcutsInput
    owner?: AgentCreateNestedOneWithoutOwnedShortcutsInput
    createdBy: AgentCreateNestedOneWithoutCreatedShortcutsInput
    updatedBy?: AgentCreateNestedOneWithoutUpdatedShortcutsInput
    audits?: ShortcutAuditCreateNestedManyWithoutShortcutInput
  }

  export type ShortcutUncheckedCreateInput = {
    id?: string
    title: string
    message: string
    type: $Enums.ShortcutType
    scope: $Enums.ShortcutScope
    departmentId?: string | null
    ownerId?: string | null
    isActive?: boolean
    sortOrder?: number
    createdById: string
    updatedById?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    archivedAt?: Date | string | null
    audits?: ShortcutAuditUncheckedCreateNestedManyWithoutShortcutInput
  }

  export type ShortcutUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    message?: StringFieldUpdateOperationsInput | string
    type?: EnumShortcutTypeFieldUpdateOperationsInput | $Enums.ShortcutType
    scope?: EnumShortcutScopeFieldUpdateOperationsInput | $Enums.ShortcutScope
    isActive?: BoolFieldUpdateOperationsInput | boolean
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    archivedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    department?: DepartmentUpdateOneWithoutShortcutsNestedInput
    owner?: AgentUpdateOneWithoutOwnedShortcutsNestedInput
    createdBy?: AgentUpdateOneRequiredWithoutCreatedShortcutsNestedInput
    updatedBy?: AgentUpdateOneWithoutUpdatedShortcutsNestedInput
    audits?: ShortcutAuditUpdateManyWithoutShortcutNestedInput
  }

  export type ShortcutUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    message?: StringFieldUpdateOperationsInput | string
    type?: EnumShortcutTypeFieldUpdateOperationsInput | $Enums.ShortcutType
    scope?: EnumShortcutScopeFieldUpdateOperationsInput | $Enums.ShortcutScope
    departmentId?: NullableStringFieldUpdateOperationsInput | string | null
    ownerId?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdById?: StringFieldUpdateOperationsInput | string
    updatedById?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    archivedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    audits?: ShortcutAuditUncheckedUpdateManyWithoutShortcutNestedInput
  }

  export type ShortcutCreateManyInput = {
    id?: string
    title: string
    message: string
    type: $Enums.ShortcutType
    scope: $Enums.ShortcutScope
    departmentId?: string | null
    ownerId?: string | null
    isActive?: boolean
    sortOrder?: number
    createdById: string
    updatedById?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    archivedAt?: Date | string | null
  }

  export type ShortcutUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    message?: StringFieldUpdateOperationsInput | string
    type?: EnumShortcutTypeFieldUpdateOperationsInput | $Enums.ShortcutType
    scope?: EnumShortcutScopeFieldUpdateOperationsInput | $Enums.ShortcutScope
    isActive?: BoolFieldUpdateOperationsInput | boolean
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    archivedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type ShortcutUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    message?: StringFieldUpdateOperationsInput | string
    type?: EnumShortcutTypeFieldUpdateOperationsInput | $Enums.ShortcutType
    scope?: EnumShortcutScopeFieldUpdateOperationsInput | $Enums.ShortcutScope
    departmentId?: NullableStringFieldUpdateOperationsInput | string | null
    ownerId?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdById?: StringFieldUpdateOperationsInput | string
    updatedById?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    archivedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type ShortcutAuditCreateInput = {
    id?: string
    action: string
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    shortcut?: ShortcutCreateNestedOneWithoutAuditsInput
    actor: AgentCreateNestedOneWithoutShortcutAuditsInput
  }

  export type ShortcutAuditUncheckedCreateInput = {
    id?: string
    shortcutId?: string | null
    actorId: string
    action: string
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
  }

  export type ShortcutAuditUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    shortcut?: ShortcutUpdateOneWithoutAuditsNestedInput
    actor?: AgentUpdateOneRequiredWithoutShortcutAuditsNestedInput
  }

  export type ShortcutAuditUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    shortcutId?: NullableStringFieldUpdateOperationsInput | string | null
    actorId?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ShortcutAuditCreateManyInput = {
    id?: string
    shortcutId?: string | null
    actorId: string
    action: string
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
  }

  export type ShortcutAuditUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ShortcutAuditUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    shortcutId?: NullableStringFieldUpdateOperationsInput | string | null
    actorId?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type ProcedureListRelationFilter = {
    every?: ProcedureWhereInput
    some?: ProcedureWhereInput
    none?: ProcedureWhereInput
  }

  export type AgentListRelationFilter = {
    every?: AgentWhereInput
    some?: AgentWhereInput
    none?: AgentWhereInput
  }

  export type ConversationListRelationFilter = {
    every?: ConversationWhereInput
    some?: ConversationWhereInput
    none?: ConversationWhereInput
  }

  export type ShortcutListRelationFilter = {
    every?: ShortcutWhereInput
    some?: ShortcutWhereInput
    none?: ShortcutWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type ProcedureOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type AgentOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ConversationOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ShortcutOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type DepartmentCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    createdAt?: SortOrder
  }

  export type DepartmentMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    createdAt?: SortOrder
  }

  export type DepartmentMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    createdAt?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type DepartmentRelationFilter = {
    is?: DepartmentWhereInput
    isNot?: DepartmentWhereInput
  }

  export type ProcedureCountOrderByAggregateInput = {
    id?: SortOrder
    departmentId?: SortOrder
    title?: SortOrder
    content?: SortOrder
    order?: SortOrder
  }

  export type ProcedureAvgOrderByAggregateInput = {
    order?: SortOrder
  }

  export type ProcedureMaxOrderByAggregateInput = {
    id?: SortOrder
    departmentId?: SortOrder
    title?: SortOrder
    content?: SortOrder
    order?: SortOrder
  }

  export type ProcedureMinOrderByAggregateInput = {
    id?: SortOrder
    departmentId?: SortOrder
    title?: SortOrder
    content?: SortOrder
    order?: SortOrder
  }

  export type ProcedureSumOrderByAggregateInput = {
    order?: SortOrder
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type DepartmentNullableRelationFilter = {
    is?: DepartmentWhereInput | null
    isNot?: DepartmentWhereInput | null
  }

  export type MessageListRelationFilter = {
    every?: MessageWhereInput
    some?: MessageWhereInput
    none?: MessageWhereInput
  }

  export type ShortcutAuditListRelationFilter = {
    every?: ShortcutAuditWhereInput
    some?: ShortcutAuditWhereInput
    none?: ShortcutAuditWhereInput
  }

  export type MessageOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ShortcutAuditOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type AgentCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    password?: SortOrder
    role?: SortOrder
    isActive?: SortOrder
    departmentId?: SortOrder
    isOnline?: SortOrder
    createdAt?: SortOrder
  }

  export type AgentMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    password?: SortOrder
    role?: SortOrder
    isActive?: SortOrder
    departmentId?: SortOrder
    isOnline?: SortOrder
    createdAt?: SortOrder
  }

  export type AgentMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    password?: SortOrder
    role?: SortOrder
    isActive?: SortOrder
    departmentId?: SortOrder
    isOnline?: SortOrder
    createdAt?: SortOrder
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type StringNullableListFilter<$PrismaModel = never> = {
    equals?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    has?: string | StringFieldRefInput<$PrismaModel> | null
    hasEvery?: string[] | ListStringFieldRefInput<$PrismaModel>
    hasSome?: string[] | ListStringFieldRefInput<$PrismaModel>
    isEmpty?: boolean
  }

  export type RolePermissionRoleResourceCompoundUniqueInput = {
    role: string
    resource: string
  }

  export type RolePermissionCountOrderByAggregateInput = {
    id?: SortOrder
    role?: SortOrder
    resource?: SortOrder
    actions?: SortOrder
    updatedAt?: SortOrder
  }

  export type RolePermissionMaxOrderByAggregateInput = {
    id?: SortOrder
    role?: SortOrder
    resource?: SortOrder
    updatedAt?: SortOrder
  }

  export type RolePermissionMinOrderByAggregateInput = {
    id?: SortOrder
    role?: SortOrder
    resource?: SortOrder
    updatedAt?: SortOrder
  }

  export type ContactCountOrderByAggregateInput = {
    id?: SortOrder
    phone?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
  }

  export type ContactMaxOrderByAggregateInput = {
    id?: SortOrder
    phone?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
  }

  export type ContactMinOrderByAggregateInput = {
    id?: SortOrder
    phone?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type ContactRelationFilter = {
    is?: ContactWhereInput
    isNot?: ContactWhereInput
  }

  export type AgentNullableRelationFilter = {
    is?: AgentWhereInput | null
    isNot?: AgentWhereInput | null
  }

  export type ConversationCountOrderByAggregateInput = {
    id?: SortOrder
    contactId?: SortOrder
    status?: SortOrder
    departmentId?: SortOrder
    assignedAgentId?: SortOrder
    currentStep?: SortOrder
    startedAt?: SortOrder
    closedAt?: SortOrder
  }

  export type ConversationMaxOrderByAggregateInput = {
    id?: SortOrder
    contactId?: SortOrder
    status?: SortOrder
    departmentId?: SortOrder
    assignedAgentId?: SortOrder
    currentStep?: SortOrder
    startedAt?: SortOrder
    closedAt?: SortOrder
  }

  export type ConversationMinOrderByAggregateInput = {
    id?: SortOrder
    contactId?: SortOrder
    status?: SortOrder
    departmentId?: SortOrder
    assignedAgentId?: SortOrder
    currentStep?: SortOrder
    startedAt?: SortOrder
    closedAt?: SortOrder
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type ConversationRelationFilter = {
    is?: ConversationWhereInput
    isNot?: ConversationWhereInput
  }

  export type MessageCountOrderByAggregateInput = {
    id?: SortOrder
    conversationId?: SortOrder
    direction?: SortOrder
    senderType?: SortOrder
    senderAgentId?: SortOrder
    content?: SortOrder
    createdAt?: SortOrder
    readAt?: SortOrder
  }

  export type MessageMaxOrderByAggregateInput = {
    id?: SortOrder
    conversationId?: SortOrder
    direction?: SortOrder
    senderType?: SortOrder
    senderAgentId?: SortOrder
    content?: SortOrder
    createdAt?: SortOrder
    readAt?: SortOrder
  }

  export type MessageMinOrderByAggregateInput = {
    id?: SortOrder
    conversationId?: SortOrder
    direction?: SortOrder
    senderType?: SortOrder
    senderAgentId?: SortOrder
    content?: SortOrder
    createdAt?: SortOrder
    readAt?: SortOrder
  }
  export type JsonFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<JsonFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonFilterBase<$PrismaModel>>, 'path'>>

  export type JsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type FlowDefinitionCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    greeting?: SortOrder
    menuMessage?: SortOrder
    options?: SortOrder
    updatedAt?: SortOrder
  }

  export type FlowDefinitionMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    greeting?: SortOrder
    menuMessage?: SortOrder
    updatedAt?: SortOrder
  }

  export type FlowDefinitionMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    greeting?: SortOrder
    menuMessage?: SortOrder
    updatedAt?: SortOrder
  }
  export type JsonWithAggregatesFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedJsonFilter<$PrismaModel>
    _max?: NestedJsonFilter<$PrismaModel>
  }

  export type ZApiConfigCountOrderByAggregateInput = {
    id?: SortOrder
    instanceId?: SortOrder
    token?: SortOrder
    clientToken?: SortOrder
    webhookUrl?: SortOrder
    isActive?: SortOrder
    autoReply?: SortOrder
    updatedAt?: SortOrder
  }

  export type ZApiConfigMaxOrderByAggregateInput = {
    id?: SortOrder
    instanceId?: SortOrder
    token?: SortOrder
    clientToken?: SortOrder
    webhookUrl?: SortOrder
    isActive?: SortOrder
    autoReply?: SortOrder
    updatedAt?: SortOrder
  }

  export type ZApiConfigMinOrderByAggregateInput = {
    id?: SortOrder
    instanceId?: SortOrder
    token?: SortOrder
    clientToken?: SortOrder
    webhookUrl?: SortOrder
    isActive?: SortOrder
    autoReply?: SortOrder
    updatedAt?: SortOrder
  }

  export type EnumShortcutTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.ShortcutType | EnumShortcutTypeFieldRefInput<$PrismaModel>
    in?: $Enums.ShortcutType[] | ListEnumShortcutTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.ShortcutType[] | ListEnumShortcutTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumShortcutTypeFilter<$PrismaModel> | $Enums.ShortcutType
  }

  export type EnumShortcutScopeFilter<$PrismaModel = never> = {
    equals?: $Enums.ShortcutScope | EnumShortcutScopeFieldRefInput<$PrismaModel>
    in?: $Enums.ShortcutScope[] | ListEnumShortcutScopeFieldRefInput<$PrismaModel>
    notIn?: $Enums.ShortcutScope[] | ListEnumShortcutScopeFieldRefInput<$PrismaModel>
    not?: NestedEnumShortcutScopeFilter<$PrismaModel> | $Enums.ShortcutScope
  }

  export type AgentRelationFilter = {
    is?: AgentWhereInput
    isNot?: AgentWhereInput
  }

  export type ShortcutCountOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    message?: SortOrder
    type?: SortOrder
    scope?: SortOrder
    departmentId?: SortOrder
    ownerId?: SortOrder
    isActive?: SortOrder
    sortOrder?: SortOrder
    createdById?: SortOrder
    updatedById?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    archivedAt?: SortOrder
  }

  export type ShortcutAvgOrderByAggregateInput = {
    sortOrder?: SortOrder
  }

  export type ShortcutMaxOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    message?: SortOrder
    type?: SortOrder
    scope?: SortOrder
    departmentId?: SortOrder
    ownerId?: SortOrder
    isActive?: SortOrder
    sortOrder?: SortOrder
    createdById?: SortOrder
    updatedById?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    archivedAt?: SortOrder
  }

  export type ShortcutMinOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    message?: SortOrder
    type?: SortOrder
    scope?: SortOrder
    departmentId?: SortOrder
    ownerId?: SortOrder
    isActive?: SortOrder
    sortOrder?: SortOrder
    createdById?: SortOrder
    updatedById?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    archivedAt?: SortOrder
  }

  export type ShortcutSumOrderByAggregateInput = {
    sortOrder?: SortOrder
  }

  export type EnumShortcutTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ShortcutType | EnumShortcutTypeFieldRefInput<$PrismaModel>
    in?: $Enums.ShortcutType[] | ListEnumShortcutTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.ShortcutType[] | ListEnumShortcutTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumShortcutTypeWithAggregatesFilter<$PrismaModel> | $Enums.ShortcutType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumShortcutTypeFilter<$PrismaModel>
    _max?: NestedEnumShortcutTypeFilter<$PrismaModel>
  }

  export type EnumShortcutScopeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ShortcutScope | EnumShortcutScopeFieldRefInput<$PrismaModel>
    in?: $Enums.ShortcutScope[] | ListEnumShortcutScopeFieldRefInput<$PrismaModel>
    notIn?: $Enums.ShortcutScope[] | ListEnumShortcutScopeFieldRefInput<$PrismaModel>
    not?: NestedEnumShortcutScopeWithAggregatesFilter<$PrismaModel> | $Enums.ShortcutScope
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumShortcutScopeFilter<$PrismaModel>
    _max?: NestedEnumShortcutScopeFilter<$PrismaModel>
  }
  export type JsonNullableFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<JsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type ShortcutNullableRelationFilter = {
    is?: ShortcutWhereInput | null
    isNot?: ShortcutWhereInput | null
  }

  export type ShortcutAuditCountOrderByAggregateInput = {
    id?: SortOrder
    shortcutId?: SortOrder
    actorId?: SortOrder
    action?: SortOrder
    metadata?: SortOrder
    createdAt?: SortOrder
  }

  export type ShortcutAuditMaxOrderByAggregateInput = {
    id?: SortOrder
    shortcutId?: SortOrder
    actorId?: SortOrder
    action?: SortOrder
    createdAt?: SortOrder
  }

  export type ShortcutAuditMinOrderByAggregateInput = {
    id?: SortOrder
    shortcutId?: SortOrder
    actorId?: SortOrder
    action?: SortOrder
    createdAt?: SortOrder
  }
  export type JsonNullableWithAggregatesFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedJsonNullableFilter<$PrismaModel>
    _max?: NestedJsonNullableFilter<$PrismaModel>
  }

  export type ProcedureCreateNestedManyWithoutDepartmentInput = {
    create?: XOR<ProcedureCreateWithoutDepartmentInput, ProcedureUncheckedCreateWithoutDepartmentInput> | ProcedureCreateWithoutDepartmentInput[] | ProcedureUncheckedCreateWithoutDepartmentInput[]
    connectOrCreate?: ProcedureCreateOrConnectWithoutDepartmentInput | ProcedureCreateOrConnectWithoutDepartmentInput[]
    createMany?: ProcedureCreateManyDepartmentInputEnvelope
    connect?: ProcedureWhereUniqueInput | ProcedureWhereUniqueInput[]
  }

  export type AgentCreateNestedManyWithoutDepartmentInput = {
    create?: XOR<AgentCreateWithoutDepartmentInput, AgentUncheckedCreateWithoutDepartmentInput> | AgentCreateWithoutDepartmentInput[] | AgentUncheckedCreateWithoutDepartmentInput[]
    connectOrCreate?: AgentCreateOrConnectWithoutDepartmentInput | AgentCreateOrConnectWithoutDepartmentInput[]
    createMany?: AgentCreateManyDepartmentInputEnvelope
    connect?: AgentWhereUniqueInput | AgentWhereUniqueInput[]
  }

  export type ConversationCreateNestedManyWithoutDepartmentInput = {
    create?: XOR<ConversationCreateWithoutDepartmentInput, ConversationUncheckedCreateWithoutDepartmentInput> | ConversationCreateWithoutDepartmentInput[] | ConversationUncheckedCreateWithoutDepartmentInput[]
    connectOrCreate?: ConversationCreateOrConnectWithoutDepartmentInput | ConversationCreateOrConnectWithoutDepartmentInput[]
    createMany?: ConversationCreateManyDepartmentInputEnvelope
    connect?: ConversationWhereUniqueInput | ConversationWhereUniqueInput[]
  }

  export type ShortcutCreateNestedManyWithoutDepartmentInput = {
    create?: XOR<ShortcutCreateWithoutDepartmentInput, ShortcutUncheckedCreateWithoutDepartmentInput> | ShortcutCreateWithoutDepartmentInput[] | ShortcutUncheckedCreateWithoutDepartmentInput[]
    connectOrCreate?: ShortcutCreateOrConnectWithoutDepartmentInput | ShortcutCreateOrConnectWithoutDepartmentInput[]
    createMany?: ShortcutCreateManyDepartmentInputEnvelope
    connect?: ShortcutWhereUniqueInput | ShortcutWhereUniqueInput[]
  }

  export type ProcedureUncheckedCreateNestedManyWithoutDepartmentInput = {
    create?: XOR<ProcedureCreateWithoutDepartmentInput, ProcedureUncheckedCreateWithoutDepartmentInput> | ProcedureCreateWithoutDepartmentInput[] | ProcedureUncheckedCreateWithoutDepartmentInput[]
    connectOrCreate?: ProcedureCreateOrConnectWithoutDepartmentInput | ProcedureCreateOrConnectWithoutDepartmentInput[]
    createMany?: ProcedureCreateManyDepartmentInputEnvelope
    connect?: ProcedureWhereUniqueInput | ProcedureWhereUniqueInput[]
  }

  export type AgentUncheckedCreateNestedManyWithoutDepartmentInput = {
    create?: XOR<AgentCreateWithoutDepartmentInput, AgentUncheckedCreateWithoutDepartmentInput> | AgentCreateWithoutDepartmentInput[] | AgentUncheckedCreateWithoutDepartmentInput[]
    connectOrCreate?: AgentCreateOrConnectWithoutDepartmentInput | AgentCreateOrConnectWithoutDepartmentInput[]
    createMany?: AgentCreateManyDepartmentInputEnvelope
    connect?: AgentWhereUniqueInput | AgentWhereUniqueInput[]
  }

  export type ConversationUncheckedCreateNestedManyWithoutDepartmentInput = {
    create?: XOR<ConversationCreateWithoutDepartmentInput, ConversationUncheckedCreateWithoutDepartmentInput> | ConversationCreateWithoutDepartmentInput[] | ConversationUncheckedCreateWithoutDepartmentInput[]
    connectOrCreate?: ConversationCreateOrConnectWithoutDepartmentInput | ConversationCreateOrConnectWithoutDepartmentInput[]
    createMany?: ConversationCreateManyDepartmentInputEnvelope
    connect?: ConversationWhereUniqueInput | ConversationWhereUniqueInput[]
  }

  export type ShortcutUncheckedCreateNestedManyWithoutDepartmentInput = {
    create?: XOR<ShortcutCreateWithoutDepartmentInput, ShortcutUncheckedCreateWithoutDepartmentInput> | ShortcutCreateWithoutDepartmentInput[] | ShortcutUncheckedCreateWithoutDepartmentInput[]
    connectOrCreate?: ShortcutCreateOrConnectWithoutDepartmentInput | ShortcutCreateOrConnectWithoutDepartmentInput[]
    createMany?: ShortcutCreateManyDepartmentInputEnvelope
    connect?: ShortcutWhereUniqueInput | ShortcutWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type ProcedureUpdateManyWithoutDepartmentNestedInput = {
    create?: XOR<ProcedureCreateWithoutDepartmentInput, ProcedureUncheckedCreateWithoutDepartmentInput> | ProcedureCreateWithoutDepartmentInput[] | ProcedureUncheckedCreateWithoutDepartmentInput[]
    connectOrCreate?: ProcedureCreateOrConnectWithoutDepartmentInput | ProcedureCreateOrConnectWithoutDepartmentInput[]
    upsert?: ProcedureUpsertWithWhereUniqueWithoutDepartmentInput | ProcedureUpsertWithWhereUniqueWithoutDepartmentInput[]
    createMany?: ProcedureCreateManyDepartmentInputEnvelope
    set?: ProcedureWhereUniqueInput | ProcedureWhereUniqueInput[]
    disconnect?: ProcedureWhereUniqueInput | ProcedureWhereUniqueInput[]
    delete?: ProcedureWhereUniqueInput | ProcedureWhereUniqueInput[]
    connect?: ProcedureWhereUniqueInput | ProcedureWhereUniqueInput[]
    update?: ProcedureUpdateWithWhereUniqueWithoutDepartmentInput | ProcedureUpdateWithWhereUniqueWithoutDepartmentInput[]
    updateMany?: ProcedureUpdateManyWithWhereWithoutDepartmentInput | ProcedureUpdateManyWithWhereWithoutDepartmentInput[]
    deleteMany?: ProcedureScalarWhereInput | ProcedureScalarWhereInput[]
  }

  export type AgentUpdateManyWithoutDepartmentNestedInput = {
    create?: XOR<AgentCreateWithoutDepartmentInput, AgentUncheckedCreateWithoutDepartmentInput> | AgentCreateWithoutDepartmentInput[] | AgentUncheckedCreateWithoutDepartmentInput[]
    connectOrCreate?: AgentCreateOrConnectWithoutDepartmentInput | AgentCreateOrConnectWithoutDepartmentInput[]
    upsert?: AgentUpsertWithWhereUniqueWithoutDepartmentInput | AgentUpsertWithWhereUniqueWithoutDepartmentInput[]
    createMany?: AgentCreateManyDepartmentInputEnvelope
    set?: AgentWhereUniqueInput | AgentWhereUniqueInput[]
    disconnect?: AgentWhereUniqueInput | AgentWhereUniqueInput[]
    delete?: AgentWhereUniqueInput | AgentWhereUniqueInput[]
    connect?: AgentWhereUniqueInput | AgentWhereUniqueInput[]
    update?: AgentUpdateWithWhereUniqueWithoutDepartmentInput | AgentUpdateWithWhereUniqueWithoutDepartmentInput[]
    updateMany?: AgentUpdateManyWithWhereWithoutDepartmentInput | AgentUpdateManyWithWhereWithoutDepartmentInput[]
    deleteMany?: AgentScalarWhereInput | AgentScalarWhereInput[]
  }

  export type ConversationUpdateManyWithoutDepartmentNestedInput = {
    create?: XOR<ConversationCreateWithoutDepartmentInput, ConversationUncheckedCreateWithoutDepartmentInput> | ConversationCreateWithoutDepartmentInput[] | ConversationUncheckedCreateWithoutDepartmentInput[]
    connectOrCreate?: ConversationCreateOrConnectWithoutDepartmentInput | ConversationCreateOrConnectWithoutDepartmentInput[]
    upsert?: ConversationUpsertWithWhereUniqueWithoutDepartmentInput | ConversationUpsertWithWhereUniqueWithoutDepartmentInput[]
    createMany?: ConversationCreateManyDepartmentInputEnvelope
    set?: ConversationWhereUniqueInput | ConversationWhereUniqueInput[]
    disconnect?: ConversationWhereUniqueInput | ConversationWhereUniqueInput[]
    delete?: ConversationWhereUniqueInput | ConversationWhereUniqueInput[]
    connect?: ConversationWhereUniqueInput | ConversationWhereUniqueInput[]
    update?: ConversationUpdateWithWhereUniqueWithoutDepartmentInput | ConversationUpdateWithWhereUniqueWithoutDepartmentInput[]
    updateMany?: ConversationUpdateManyWithWhereWithoutDepartmentInput | ConversationUpdateManyWithWhereWithoutDepartmentInput[]
    deleteMany?: ConversationScalarWhereInput | ConversationScalarWhereInput[]
  }

  export type ShortcutUpdateManyWithoutDepartmentNestedInput = {
    create?: XOR<ShortcutCreateWithoutDepartmentInput, ShortcutUncheckedCreateWithoutDepartmentInput> | ShortcutCreateWithoutDepartmentInput[] | ShortcutUncheckedCreateWithoutDepartmentInput[]
    connectOrCreate?: ShortcutCreateOrConnectWithoutDepartmentInput | ShortcutCreateOrConnectWithoutDepartmentInput[]
    upsert?: ShortcutUpsertWithWhereUniqueWithoutDepartmentInput | ShortcutUpsertWithWhereUniqueWithoutDepartmentInput[]
    createMany?: ShortcutCreateManyDepartmentInputEnvelope
    set?: ShortcutWhereUniqueInput | ShortcutWhereUniqueInput[]
    disconnect?: ShortcutWhereUniqueInput | ShortcutWhereUniqueInput[]
    delete?: ShortcutWhereUniqueInput | ShortcutWhereUniqueInput[]
    connect?: ShortcutWhereUniqueInput | ShortcutWhereUniqueInput[]
    update?: ShortcutUpdateWithWhereUniqueWithoutDepartmentInput | ShortcutUpdateWithWhereUniqueWithoutDepartmentInput[]
    updateMany?: ShortcutUpdateManyWithWhereWithoutDepartmentInput | ShortcutUpdateManyWithWhereWithoutDepartmentInput[]
    deleteMany?: ShortcutScalarWhereInput | ShortcutScalarWhereInput[]
  }

  export type ProcedureUncheckedUpdateManyWithoutDepartmentNestedInput = {
    create?: XOR<ProcedureCreateWithoutDepartmentInput, ProcedureUncheckedCreateWithoutDepartmentInput> | ProcedureCreateWithoutDepartmentInput[] | ProcedureUncheckedCreateWithoutDepartmentInput[]
    connectOrCreate?: ProcedureCreateOrConnectWithoutDepartmentInput | ProcedureCreateOrConnectWithoutDepartmentInput[]
    upsert?: ProcedureUpsertWithWhereUniqueWithoutDepartmentInput | ProcedureUpsertWithWhereUniqueWithoutDepartmentInput[]
    createMany?: ProcedureCreateManyDepartmentInputEnvelope
    set?: ProcedureWhereUniqueInput | ProcedureWhereUniqueInput[]
    disconnect?: ProcedureWhereUniqueInput | ProcedureWhereUniqueInput[]
    delete?: ProcedureWhereUniqueInput | ProcedureWhereUniqueInput[]
    connect?: ProcedureWhereUniqueInput | ProcedureWhereUniqueInput[]
    update?: ProcedureUpdateWithWhereUniqueWithoutDepartmentInput | ProcedureUpdateWithWhereUniqueWithoutDepartmentInput[]
    updateMany?: ProcedureUpdateManyWithWhereWithoutDepartmentInput | ProcedureUpdateManyWithWhereWithoutDepartmentInput[]
    deleteMany?: ProcedureScalarWhereInput | ProcedureScalarWhereInput[]
  }

  export type AgentUncheckedUpdateManyWithoutDepartmentNestedInput = {
    create?: XOR<AgentCreateWithoutDepartmentInput, AgentUncheckedCreateWithoutDepartmentInput> | AgentCreateWithoutDepartmentInput[] | AgentUncheckedCreateWithoutDepartmentInput[]
    connectOrCreate?: AgentCreateOrConnectWithoutDepartmentInput | AgentCreateOrConnectWithoutDepartmentInput[]
    upsert?: AgentUpsertWithWhereUniqueWithoutDepartmentInput | AgentUpsertWithWhereUniqueWithoutDepartmentInput[]
    createMany?: AgentCreateManyDepartmentInputEnvelope
    set?: AgentWhereUniqueInput | AgentWhereUniqueInput[]
    disconnect?: AgentWhereUniqueInput | AgentWhereUniqueInput[]
    delete?: AgentWhereUniqueInput | AgentWhereUniqueInput[]
    connect?: AgentWhereUniqueInput | AgentWhereUniqueInput[]
    update?: AgentUpdateWithWhereUniqueWithoutDepartmentInput | AgentUpdateWithWhereUniqueWithoutDepartmentInput[]
    updateMany?: AgentUpdateManyWithWhereWithoutDepartmentInput | AgentUpdateManyWithWhereWithoutDepartmentInput[]
    deleteMany?: AgentScalarWhereInput | AgentScalarWhereInput[]
  }

  export type ConversationUncheckedUpdateManyWithoutDepartmentNestedInput = {
    create?: XOR<ConversationCreateWithoutDepartmentInput, ConversationUncheckedCreateWithoutDepartmentInput> | ConversationCreateWithoutDepartmentInput[] | ConversationUncheckedCreateWithoutDepartmentInput[]
    connectOrCreate?: ConversationCreateOrConnectWithoutDepartmentInput | ConversationCreateOrConnectWithoutDepartmentInput[]
    upsert?: ConversationUpsertWithWhereUniqueWithoutDepartmentInput | ConversationUpsertWithWhereUniqueWithoutDepartmentInput[]
    createMany?: ConversationCreateManyDepartmentInputEnvelope
    set?: ConversationWhereUniqueInput | ConversationWhereUniqueInput[]
    disconnect?: ConversationWhereUniqueInput | ConversationWhereUniqueInput[]
    delete?: ConversationWhereUniqueInput | ConversationWhereUniqueInput[]
    connect?: ConversationWhereUniqueInput | ConversationWhereUniqueInput[]
    update?: ConversationUpdateWithWhereUniqueWithoutDepartmentInput | ConversationUpdateWithWhereUniqueWithoutDepartmentInput[]
    updateMany?: ConversationUpdateManyWithWhereWithoutDepartmentInput | ConversationUpdateManyWithWhereWithoutDepartmentInput[]
    deleteMany?: ConversationScalarWhereInput | ConversationScalarWhereInput[]
  }

  export type ShortcutUncheckedUpdateManyWithoutDepartmentNestedInput = {
    create?: XOR<ShortcutCreateWithoutDepartmentInput, ShortcutUncheckedCreateWithoutDepartmentInput> | ShortcutCreateWithoutDepartmentInput[] | ShortcutUncheckedCreateWithoutDepartmentInput[]
    connectOrCreate?: ShortcutCreateOrConnectWithoutDepartmentInput | ShortcutCreateOrConnectWithoutDepartmentInput[]
    upsert?: ShortcutUpsertWithWhereUniqueWithoutDepartmentInput | ShortcutUpsertWithWhereUniqueWithoutDepartmentInput[]
    createMany?: ShortcutCreateManyDepartmentInputEnvelope
    set?: ShortcutWhereUniqueInput | ShortcutWhereUniqueInput[]
    disconnect?: ShortcutWhereUniqueInput | ShortcutWhereUniqueInput[]
    delete?: ShortcutWhereUniqueInput | ShortcutWhereUniqueInput[]
    connect?: ShortcutWhereUniqueInput | ShortcutWhereUniqueInput[]
    update?: ShortcutUpdateWithWhereUniqueWithoutDepartmentInput | ShortcutUpdateWithWhereUniqueWithoutDepartmentInput[]
    updateMany?: ShortcutUpdateManyWithWhereWithoutDepartmentInput | ShortcutUpdateManyWithWhereWithoutDepartmentInput[]
    deleteMany?: ShortcutScalarWhereInput | ShortcutScalarWhereInput[]
  }

  export type DepartmentCreateNestedOneWithoutProceduresInput = {
    create?: XOR<DepartmentCreateWithoutProceduresInput, DepartmentUncheckedCreateWithoutProceduresInput>
    connectOrCreate?: DepartmentCreateOrConnectWithoutProceduresInput
    connect?: DepartmentWhereUniqueInput
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type DepartmentUpdateOneRequiredWithoutProceduresNestedInput = {
    create?: XOR<DepartmentCreateWithoutProceduresInput, DepartmentUncheckedCreateWithoutProceduresInput>
    connectOrCreate?: DepartmentCreateOrConnectWithoutProceduresInput
    upsert?: DepartmentUpsertWithoutProceduresInput
    connect?: DepartmentWhereUniqueInput
    update?: XOR<XOR<DepartmentUpdateToOneWithWhereWithoutProceduresInput, DepartmentUpdateWithoutProceduresInput>, DepartmentUncheckedUpdateWithoutProceduresInput>
  }

  export type DepartmentCreateNestedOneWithoutAgentsInput = {
    create?: XOR<DepartmentCreateWithoutAgentsInput, DepartmentUncheckedCreateWithoutAgentsInput>
    connectOrCreate?: DepartmentCreateOrConnectWithoutAgentsInput
    connect?: DepartmentWhereUniqueInput
  }

  export type ConversationCreateNestedManyWithoutAssignedAgentInput = {
    create?: XOR<ConversationCreateWithoutAssignedAgentInput, ConversationUncheckedCreateWithoutAssignedAgentInput> | ConversationCreateWithoutAssignedAgentInput[] | ConversationUncheckedCreateWithoutAssignedAgentInput[]
    connectOrCreate?: ConversationCreateOrConnectWithoutAssignedAgentInput | ConversationCreateOrConnectWithoutAssignedAgentInput[]
    createMany?: ConversationCreateManyAssignedAgentInputEnvelope
    connect?: ConversationWhereUniqueInput | ConversationWhereUniqueInput[]
  }

  export type MessageCreateNestedManyWithoutSenderAgentInput = {
    create?: XOR<MessageCreateWithoutSenderAgentInput, MessageUncheckedCreateWithoutSenderAgentInput> | MessageCreateWithoutSenderAgentInput[] | MessageUncheckedCreateWithoutSenderAgentInput[]
    connectOrCreate?: MessageCreateOrConnectWithoutSenderAgentInput | MessageCreateOrConnectWithoutSenderAgentInput[]
    createMany?: MessageCreateManySenderAgentInputEnvelope
    connect?: MessageWhereUniqueInput | MessageWhereUniqueInput[]
  }

  export type ShortcutCreateNestedManyWithoutOwnerInput = {
    create?: XOR<ShortcutCreateWithoutOwnerInput, ShortcutUncheckedCreateWithoutOwnerInput> | ShortcutCreateWithoutOwnerInput[] | ShortcutUncheckedCreateWithoutOwnerInput[]
    connectOrCreate?: ShortcutCreateOrConnectWithoutOwnerInput | ShortcutCreateOrConnectWithoutOwnerInput[]
    createMany?: ShortcutCreateManyOwnerInputEnvelope
    connect?: ShortcutWhereUniqueInput | ShortcutWhereUniqueInput[]
  }

  export type ShortcutCreateNestedManyWithoutCreatedByInput = {
    create?: XOR<ShortcutCreateWithoutCreatedByInput, ShortcutUncheckedCreateWithoutCreatedByInput> | ShortcutCreateWithoutCreatedByInput[] | ShortcutUncheckedCreateWithoutCreatedByInput[]
    connectOrCreate?: ShortcutCreateOrConnectWithoutCreatedByInput | ShortcutCreateOrConnectWithoutCreatedByInput[]
    createMany?: ShortcutCreateManyCreatedByInputEnvelope
    connect?: ShortcutWhereUniqueInput | ShortcutWhereUniqueInput[]
  }

  export type ShortcutCreateNestedManyWithoutUpdatedByInput = {
    create?: XOR<ShortcutCreateWithoutUpdatedByInput, ShortcutUncheckedCreateWithoutUpdatedByInput> | ShortcutCreateWithoutUpdatedByInput[] | ShortcutUncheckedCreateWithoutUpdatedByInput[]
    connectOrCreate?: ShortcutCreateOrConnectWithoutUpdatedByInput | ShortcutCreateOrConnectWithoutUpdatedByInput[]
    createMany?: ShortcutCreateManyUpdatedByInputEnvelope
    connect?: ShortcutWhereUniqueInput | ShortcutWhereUniqueInput[]
  }

  export type ShortcutAuditCreateNestedManyWithoutActorInput = {
    create?: XOR<ShortcutAuditCreateWithoutActorInput, ShortcutAuditUncheckedCreateWithoutActorInput> | ShortcutAuditCreateWithoutActorInput[] | ShortcutAuditUncheckedCreateWithoutActorInput[]
    connectOrCreate?: ShortcutAuditCreateOrConnectWithoutActorInput | ShortcutAuditCreateOrConnectWithoutActorInput[]
    createMany?: ShortcutAuditCreateManyActorInputEnvelope
    connect?: ShortcutAuditWhereUniqueInput | ShortcutAuditWhereUniqueInput[]
  }

  export type ConversationUncheckedCreateNestedManyWithoutAssignedAgentInput = {
    create?: XOR<ConversationCreateWithoutAssignedAgentInput, ConversationUncheckedCreateWithoutAssignedAgentInput> | ConversationCreateWithoutAssignedAgentInput[] | ConversationUncheckedCreateWithoutAssignedAgentInput[]
    connectOrCreate?: ConversationCreateOrConnectWithoutAssignedAgentInput | ConversationCreateOrConnectWithoutAssignedAgentInput[]
    createMany?: ConversationCreateManyAssignedAgentInputEnvelope
    connect?: ConversationWhereUniqueInput | ConversationWhereUniqueInput[]
  }

  export type MessageUncheckedCreateNestedManyWithoutSenderAgentInput = {
    create?: XOR<MessageCreateWithoutSenderAgentInput, MessageUncheckedCreateWithoutSenderAgentInput> | MessageCreateWithoutSenderAgentInput[] | MessageUncheckedCreateWithoutSenderAgentInput[]
    connectOrCreate?: MessageCreateOrConnectWithoutSenderAgentInput | MessageCreateOrConnectWithoutSenderAgentInput[]
    createMany?: MessageCreateManySenderAgentInputEnvelope
    connect?: MessageWhereUniqueInput | MessageWhereUniqueInput[]
  }

  export type ShortcutUncheckedCreateNestedManyWithoutOwnerInput = {
    create?: XOR<ShortcutCreateWithoutOwnerInput, ShortcutUncheckedCreateWithoutOwnerInput> | ShortcutCreateWithoutOwnerInput[] | ShortcutUncheckedCreateWithoutOwnerInput[]
    connectOrCreate?: ShortcutCreateOrConnectWithoutOwnerInput | ShortcutCreateOrConnectWithoutOwnerInput[]
    createMany?: ShortcutCreateManyOwnerInputEnvelope
    connect?: ShortcutWhereUniqueInput | ShortcutWhereUniqueInput[]
  }

  export type ShortcutUncheckedCreateNestedManyWithoutCreatedByInput = {
    create?: XOR<ShortcutCreateWithoutCreatedByInput, ShortcutUncheckedCreateWithoutCreatedByInput> | ShortcutCreateWithoutCreatedByInput[] | ShortcutUncheckedCreateWithoutCreatedByInput[]
    connectOrCreate?: ShortcutCreateOrConnectWithoutCreatedByInput | ShortcutCreateOrConnectWithoutCreatedByInput[]
    createMany?: ShortcutCreateManyCreatedByInputEnvelope
    connect?: ShortcutWhereUniqueInput | ShortcutWhereUniqueInput[]
  }

  export type ShortcutUncheckedCreateNestedManyWithoutUpdatedByInput = {
    create?: XOR<ShortcutCreateWithoutUpdatedByInput, ShortcutUncheckedCreateWithoutUpdatedByInput> | ShortcutCreateWithoutUpdatedByInput[] | ShortcutUncheckedCreateWithoutUpdatedByInput[]
    connectOrCreate?: ShortcutCreateOrConnectWithoutUpdatedByInput | ShortcutCreateOrConnectWithoutUpdatedByInput[]
    createMany?: ShortcutCreateManyUpdatedByInputEnvelope
    connect?: ShortcutWhereUniqueInput | ShortcutWhereUniqueInput[]
  }

  export type ShortcutAuditUncheckedCreateNestedManyWithoutActorInput = {
    create?: XOR<ShortcutAuditCreateWithoutActorInput, ShortcutAuditUncheckedCreateWithoutActorInput> | ShortcutAuditCreateWithoutActorInput[] | ShortcutAuditUncheckedCreateWithoutActorInput[]
    connectOrCreate?: ShortcutAuditCreateOrConnectWithoutActorInput | ShortcutAuditCreateOrConnectWithoutActorInput[]
    createMany?: ShortcutAuditCreateManyActorInputEnvelope
    connect?: ShortcutAuditWhereUniqueInput | ShortcutAuditWhereUniqueInput[]
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type DepartmentUpdateOneWithoutAgentsNestedInput = {
    create?: XOR<DepartmentCreateWithoutAgentsInput, DepartmentUncheckedCreateWithoutAgentsInput>
    connectOrCreate?: DepartmentCreateOrConnectWithoutAgentsInput
    upsert?: DepartmentUpsertWithoutAgentsInput
    disconnect?: DepartmentWhereInput | boolean
    delete?: DepartmentWhereInput | boolean
    connect?: DepartmentWhereUniqueInput
    update?: XOR<XOR<DepartmentUpdateToOneWithWhereWithoutAgentsInput, DepartmentUpdateWithoutAgentsInput>, DepartmentUncheckedUpdateWithoutAgentsInput>
  }

  export type ConversationUpdateManyWithoutAssignedAgentNestedInput = {
    create?: XOR<ConversationCreateWithoutAssignedAgentInput, ConversationUncheckedCreateWithoutAssignedAgentInput> | ConversationCreateWithoutAssignedAgentInput[] | ConversationUncheckedCreateWithoutAssignedAgentInput[]
    connectOrCreate?: ConversationCreateOrConnectWithoutAssignedAgentInput | ConversationCreateOrConnectWithoutAssignedAgentInput[]
    upsert?: ConversationUpsertWithWhereUniqueWithoutAssignedAgentInput | ConversationUpsertWithWhereUniqueWithoutAssignedAgentInput[]
    createMany?: ConversationCreateManyAssignedAgentInputEnvelope
    set?: ConversationWhereUniqueInput | ConversationWhereUniqueInput[]
    disconnect?: ConversationWhereUniqueInput | ConversationWhereUniqueInput[]
    delete?: ConversationWhereUniqueInput | ConversationWhereUniqueInput[]
    connect?: ConversationWhereUniqueInput | ConversationWhereUniqueInput[]
    update?: ConversationUpdateWithWhereUniqueWithoutAssignedAgentInput | ConversationUpdateWithWhereUniqueWithoutAssignedAgentInput[]
    updateMany?: ConversationUpdateManyWithWhereWithoutAssignedAgentInput | ConversationUpdateManyWithWhereWithoutAssignedAgentInput[]
    deleteMany?: ConversationScalarWhereInput | ConversationScalarWhereInput[]
  }

  export type MessageUpdateManyWithoutSenderAgentNestedInput = {
    create?: XOR<MessageCreateWithoutSenderAgentInput, MessageUncheckedCreateWithoutSenderAgentInput> | MessageCreateWithoutSenderAgentInput[] | MessageUncheckedCreateWithoutSenderAgentInput[]
    connectOrCreate?: MessageCreateOrConnectWithoutSenderAgentInput | MessageCreateOrConnectWithoutSenderAgentInput[]
    upsert?: MessageUpsertWithWhereUniqueWithoutSenderAgentInput | MessageUpsertWithWhereUniqueWithoutSenderAgentInput[]
    createMany?: MessageCreateManySenderAgentInputEnvelope
    set?: MessageWhereUniqueInput | MessageWhereUniqueInput[]
    disconnect?: MessageWhereUniqueInput | MessageWhereUniqueInput[]
    delete?: MessageWhereUniqueInput | MessageWhereUniqueInput[]
    connect?: MessageWhereUniqueInput | MessageWhereUniqueInput[]
    update?: MessageUpdateWithWhereUniqueWithoutSenderAgentInput | MessageUpdateWithWhereUniqueWithoutSenderAgentInput[]
    updateMany?: MessageUpdateManyWithWhereWithoutSenderAgentInput | MessageUpdateManyWithWhereWithoutSenderAgentInput[]
    deleteMany?: MessageScalarWhereInput | MessageScalarWhereInput[]
  }

  export type ShortcutUpdateManyWithoutOwnerNestedInput = {
    create?: XOR<ShortcutCreateWithoutOwnerInput, ShortcutUncheckedCreateWithoutOwnerInput> | ShortcutCreateWithoutOwnerInput[] | ShortcutUncheckedCreateWithoutOwnerInput[]
    connectOrCreate?: ShortcutCreateOrConnectWithoutOwnerInput | ShortcutCreateOrConnectWithoutOwnerInput[]
    upsert?: ShortcutUpsertWithWhereUniqueWithoutOwnerInput | ShortcutUpsertWithWhereUniqueWithoutOwnerInput[]
    createMany?: ShortcutCreateManyOwnerInputEnvelope
    set?: ShortcutWhereUniqueInput | ShortcutWhereUniqueInput[]
    disconnect?: ShortcutWhereUniqueInput | ShortcutWhereUniqueInput[]
    delete?: ShortcutWhereUniqueInput | ShortcutWhereUniqueInput[]
    connect?: ShortcutWhereUniqueInput | ShortcutWhereUniqueInput[]
    update?: ShortcutUpdateWithWhereUniqueWithoutOwnerInput | ShortcutUpdateWithWhereUniqueWithoutOwnerInput[]
    updateMany?: ShortcutUpdateManyWithWhereWithoutOwnerInput | ShortcutUpdateManyWithWhereWithoutOwnerInput[]
    deleteMany?: ShortcutScalarWhereInput | ShortcutScalarWhereInput[]
  }

  export type ShortcutUpdateManyWithoutCreatedByNestedInput = {
    create?: XOR<ShortcutCreateWithoutCreatedByInput, ShortcutUncheckedCreateWithoutCreatedByInput> | ShortcutCreateWithoutCreatedByInput[] | ShortcutUncheckedCreateWithoutCreatedByInput[]
    connectOrCreate?: ShortcutCreateOrConnectWithoutCreatedByInput | ShortcutCreateOrConnectWithoutCreatedByInput[]
    upsert?: ShortcutUpsertWithWhereUniqueWithoutCreatedByInput | ShortcutUpsertWithWhereUniqueWithoutCreatedByInput[]
    createMany?: ShortcutCreateManyCreatedByInputEnvelope
    set?: ShortcutWhereUniqueInput | ShortcutWhereUniqueInput[]
    disconnect?: ShortcutWhereUniqueInput | ShortcutWhereUniqueInput[]
    delete?: ShortcutWhereUniqueInput | ShortcutWhereUniqueInput[]
    connect?: ShortcutWhereUniqueInput | ShortcutWhereUniqueInput[]
    update?: ShortcutUpdateWithWhereUniqueWithoutCreatedByInput | ShortcutUpdateWithWhereUniqueWithoutCreatedByInput[]
    updateMany?: ShortcutUpdateManyWithWhereWithoutCreatedByInput | ShortcutUpdateManyWithWhereWithoutCreatedByInput[]
    deleteMany?: ShortcutScalarWhereInput | ShortcutScalarWhereInput[]
  }

  export type ShortcutUpdateManyWithoutUpdatedByNestedInput = {
    create?: XOR<ShortcutCreateWithoutUpdatedByInput, ShortcutUncheckedCreateWithoutUpdatedByInput> | ShortcutCreateWithoutUpdatedByInput[] | ShortcutUncheckedCreateWithoutUpdatedByInput[]
    connectOrCreate?: ShortcutCreateOrConnectWithoutUpdatedByInput | ShortcutCreateOrConnectWithoutUpdatedByInput[]
    upsert?: ShortcutUpsertWithWhereUniqueWithoutUpdatedByInput | ShortcutUpsertWithWhereUniqueWithoutUpdatedByInput[]
    createMany?: ShortcutCreateManyUpdatedByInputEnvelope
    set?: ShortcutWhereUniqueInput | ShortcutWhereUniqueInput[]
    disconnect?: ShortcutWhereUniqueInput | ShortcutWhereUniqueInput[]
    delete?: ShortcutWhereUniqueInput | ShortcutWhereUniqueInput[]
    connect?: ShortcutWhereUniqueInput | ShortcutWhereUniqueInput[]
    update?: ShortcutUpdateWithWhereUniqueWithoutUpdatedByInput | ShortcutUpdateWithWhereUniqueWithoutUpdatedByInput[]
    updateMany?: ShortcutUpdateManyWithWhereWithoutUpdatedByInput | ShortcutUpdateManyWithWhereWithoutUpdatedByInput[]
    deleteMany?: ShortcutScalarWhereInput | ShortcutScalarWhereInput[]
  }

  export type ShortcutAuditUpdateManyWithoutActorNestedInput = {
    create?: XOR<ShortcutAuditCreateWithoutActorInput, ShortcutAuditUncheckedCreateWithoutActorInput> | ShortcutAuditCreateWithoutActorInput[] | ShortcutAuditUncheckedCreateWithoutActorInput[]
    connectOrCreate?: ShortcutAuditCreateOrConnectWithoutActorInput | ShortcutAuditCreateOrConnectWithoutActorInput[]
    upsert?: ShortcutAuditUpsertWithWhereUniqueWithoutActorInput | ShortcutAuditUpsertWithWhereUniqueWithoutActorInput[]
    createMany?: ShortcutAuditCreateManyActorInputEnvelope
    set?: ShortcutAuditWhereUniqueInput | ShortcutAuditWhereUniqueInput[]
    disconnect?: ShortcutAuditWhereUniqueInput | ShortcutAuditWhereUniqueInput[]
    delete?: ShortcutAuditWhereUniqueInput | ShortcutAuditWhereUniqueInput[]
    connect?: ShortcutAuditWhereUniqueInput | ShortcutAuditWhereUniqueInput[]
    update?: ShortcutAuditUpdateWithWhereUniqueWithoutActorInput | ShortcutAuditUpdateWithWhereUniqueWithoutActorInput[]
    updateMany?: ShortcutAuditUpdateManyWithWhereWithoutActorInput | ShortcutAuditUpdateManyWithWhereWithoutActorInput[]
    deleteMany?: ShortcutAuditScalarWhereInput | ShortcutAuditScalarWhereInput[]
  }

  export type ConversationUncheckedUpdateManyWithoutAssignedAgentNestedInput = {
    create?: XOR<ConversationCreateWithoutAssignedAgentInput, ConversationUncheckedCreateWithoutAssignedAgentInput> | ConversationCreateWithoutAssignedAgentInput[] | ConversationUncheckedCreateWithoutAssignedAgentInput[]
    connectOrCreate?: ConversationCreateOrConnectWithoutAssignedAgentInput | ConversationCreateOrConnectWithoutAssignedAgentInput[]
    upsert?: ConversationUpsertWithWhereUniqueWithoutAssignedAgentInput | ConversationUpsertWithWhereUniqueWithoutAssignedAgentInput[]
    createMany?: ConversationCreateManyAssignedAgentInputEnvelope
    set?: ConversationWhereUniqueInput | ConversationWhereUniqueInput[]
    disconnect?: ConversationWhereUniqueInput | ConversationWhereUniqueInput[]
    delete?: ConversationWhereUniqueInput | ConversationWhereUniqueInput[]
    connect?: ConversationWhereUniqueInput | ConversationWhereUniqueInput[]
    update?: ConversationUpdateWithWhereUniqueWithoutAssignedAgentInput | ConversationUpdateWithWhereUniqueWithoutAssignedAgentInput[]
    updateMany?: ConversationUpdateManyWithWhereWithoutAssignedAgentInput | ConversationUpdateManyWithWhereWithoutAssignedAgentInput[]
    deleteMany?: ConversationScalarWhereInput | ConversationScalarWhereInput[]
  }

  export type MessageUncheckedUpdateManyWithoutSenderAgentNestedInput = {
    create?: XOR<MessageCreateWithoutSenderAgentInput, MessageUncheckedCreateWithoutSenderAgentInput> | MessageCreateWithoutSenderAgentInput[] | MessageUncheckedCreateWithoutSenderAgentInput[]
    connectOrCreate?: MessageCreateOrConnectWithoutSenderAgentInput | MessageCreateOrConnectWithoutSenderAgentInput[]
    upsert?: MessageUpsertWithWhereUniqueWithoutSenderAgentInput | MessageUpsertWithWhereUniqueWithoutSenderAgentInput[]
    createMany?: MessageCreateManySenderAgentInputEnvelope
    set?: MessageWhereUniqueInput | MessageWhereUniqueInput[]
    disconnect?: MessageWhereUniqueInput | MessageWhereUniqueInput[]
    delete?: MessageWhereUniqueInput | MessageWhereUniqueInput[]
    connect?: MessageWhereUniqueInput | MessageWhereUniqueInput[]
    update?: MessageUpdateWithWhereUniqueWithoutSenderAgentInput | MessageUpdateWithWhereUniqueWithoutSenderAgentInput[]
    updateMany?: MessageUpdateManyWithWhereWithoutSenderAgentInput | MessageUpdateManyWithWhereWithoutSenderAgentInput[]
    deleteMany?: MessageScalarWhereInput | MessageScalarWhereInput[]
  }

  export type ShortcutUncheckedUpdateManyWithoutOwnerNestedInput = {
    create?: XOR<ShortcutCreateWithoutOwnerInput, ShortcutUncheckedCreateWithoutOwnerInput> | ShortcutCreateWithoutOwnerInput[] | ShortcutUncheckedCreateWithoutOwnerInput[]
    connectOrCreate?: ShortcutCreateOrConnectWithoutOwnerInput | ShortcutCreateOrConnectWithoutOwnerInput[]
    upsert?: ShortcutUpsertWithWhereUniqueWithoutOwnerInput | ShortcutUpsertWithWhereUniqueWithoutOwnerInput[]
    createMany?: ShortcutCreateManyOwnerInputEnvelope
    set?: ShortcutWhereUniqueInput | ShortcutWhereUniqueInput[]
    disconnect?: ShortcutWhereUniqueInput | ShortcutWhereUniqueInput[]
    delete?: ShortcutWhereUniqueInput | ShortcutWhereUniqueInput[]
    connect?: ShortcutWhereUniqueInput | ShortcutWhereUniqueInput[]
    update?: ShortcutUpdateWithWhereUniqueWithoutOwnerInput | ShortcutUpdateWithWhereUniqueWithoutOwnerInput[]
    updateMany?: ShortcutUpdateManyWithWhereWithoutOwnerInput | ShortcutUpdateManyWithWhereWithoutOwnerInput[]
    deleteMany?: ShortcutScalarWhereInput | ShortcutScalarWhereInput[]
  }

  export type ShortcutUncheckedUpdateManyWithoutCreatedByNestedInput = {
    create?: XOR<ShortcutCreateWithoutCreatedByInput, ShortcutUncheckedCreateWithoutCreatedByInput> | ShortcutCreateWithoutCreatedByInput[] | ShortcutUncheckedCreateWithoutCreatedByInput[]
    connectOrCreate?: ShortcutCreateOrConnectWithoutCreatedByInput | ShortcutCreateOrConnectWithoutCreatedByInput[]
    upsert?: ShortcutUpsertWithWhereUniqueWithoutCreatedByInput | ShortcutUpsertWithWhereUniqueWithoutCreatedByInput[]
    createMany?: ShortcutCreateManyCreatedByInputEnvelope
    set?: ShortcutWhereUniqueInput | ShortcutWhereUniqueInput[]
    disconnect?: ShortcutWhereUniqueInput | ShortcutWhereUniqueInput[]
    delete?: ShortcutWhereUniqueInput | ShortcutWhereUniqueInput[]
    connect?: ShortcutWhereUniqueInput | ShortcutWhereUniqueInput[]
    update?: ShortcutUpdateWithWhereUniqueWithoutCreatedByInput | ShortcutUpdateWithWhereUniqueWithoutCreatedByInput[]
    updateMany?: ShortcutUpdateManyWithWhereWithoutCreatedByInput | ShortcutUpdateManyWithWhereWithoutCreatedByInput[]
    deleteMany?: ShortcutScalarWhereInput | ShortcutScalarWhereInput[]
  }

  export type ShortcutUncheckedUpdateManyWithoutUpdatedByNestedInput = {
    create?: XOR<ShortcutCreateWithoutUpdatedByInput, ShortcutUncheckedCreateWithoutUpdatedByInput> | ShortcutCreateWithoutUpdatedByInput[] | ShortcutUncheckedCreateWithoutUpdatedByInput[]
    connectOrCreate?: ShortcutCreateOrConnectWithoutUpdatedByInput | ShortcutCreateOrConnectWithoutUpdatedByInput[]
    upsert?: ShortcutUpsertWithWhereUniqueWithoutUpdatedByInput | ShortcutUpsertWithWhereUniqueWithoutUpdatedByInput[]
    createMany?: ShortcutCreateManyUpdatedByInputEnvelope
    set?: ShortcutWhereUniqueInput | ShortcutWhereUniqueInput[]
    disconnect?: ShortcutWhereUniqueInput | ShortcutWhereUniqueInput[]
    delete?: ShortcutWhereUniqueInput | ShortcutWhereUniqueInput[]
    connect?: ShortcutWhereUniqueInput | ShortcutWhereUniqueInput[]
    update?: ShortcutUpdateWithWhereUniqueWithoutUpdatedByInput | ShortcutUpdateWithWhereUniqueWithoutUpdatedByInput[]
    updateMany?: ShortcutUpdateManyWithWhereWithoutUpdatedByInput | ShortcutUpdateManyWithWhereWithoutUpdatedByInput[]
    deleteMany?: ShortcutScalarWhereInput | ShortcutScalarWhereInput[]
  }

  export type ShortcutAuditUncheckedUpdateManyWithoutActorNestedInput = {
    create?: XOR<ShortcutAuditCreateWithoutActorInput, ShortcutAuditUncheckedCreateWithoutActorInput> | ShortcutAuditCreateWithoutActorInput[] | ShortcutAuditUncheckedCreateWithoutActorInput[]
    connectOrCreate?: ShortcutAuditCreateOrConnectWithoutActorInput | ShortcutAuditCreateOrConnectWithoutActorInput[]
    upsert?: ShortcutAuditUpsertWithWhereUniqueWithoutActorInput | ShortcutAuditUpsertWithWhereUniqueWithoutActorInput[]
    createMany?: ShortcutAuditCreateManyActorInputEnvelope
    set?: ShortcutAuditWhereUniqueInput | ShortcutAuditWhereUniqueInput[]
    disconnect?: ShortcutAuditWhereUniqueInput | ShortcutAuditWhereUniqueInput[]
    delete?: ShortcutAuditWhereUniqueInput | ShortcutAuditWhereUniqueInput[]
    connect?: ShortcutAuditWhereUniqueInput | ShortcutAuditWhereUniqueInput[]
    update?: ShortcutAuditUpdateWithWhereUniqueWithoutActorInput | ShortcutAuditUpdateWithWhereUniqueWithoutActorInput[]
    updateMany?: ShortcutAuditUpdateManyWithWhereWithoutActorInput | ShortcutAuditUpdateManyWithWhereWithoutActorInput[]
    deleteMany?: ShortcutAuditScalarWhereInput | ShortcutAuditScalarWhereInput[]
  }

  export type RolePermissionCreateactionsInput = {
    set: string[]
  }

  export type RolePermissionUpdateactionsInput = {
    set?: string[]
    push?: string | string[]
  }

  export type ConversationCreateNestedManyWithoutContactInput = {
    create?: XOR<ConversationCreateWithoutContactInput, ConversationUncheckedCreateWithoutContactInput> | ConversationCreateWithoutContactInput[] | ConversationUncheckedCreateWithoutContactInput[]
    connectOrCreate?: ConversationCreateOrConnectWithoutContactInput | ConversationCreateOrConnectWithoutContactInput[]
    createMany?: ConversationCreateManyContactInputEnvelope
    connect?: ConversationWhereUniqueInput | ConversationWhereUniqueInput[]
  }

  export type ConversationUncheckedCreateNestedManyWithoutContactInput = {
    create?: XOR<ConversationCreateWithoutContactInput, ConversationUncheckedCreateWithoutContactInput> | ConversationCreateWithoutContactInput[] | ConversationUncheckedCreateWithoutContactInput[]
    connectOrCreate?: ConversationCreateOrConnectWithoutContactInput | ConversationCreateOrConnectWithoutContactInput[]
    createMany?: ConversationCreateManyContactInputEnvelope
    connect?: ConversationWhereUniqueInput | ConversationWhereUniqueInput[]
  }

  export type ConversationUpdateManyWithoutContactNestedInput = {
    create?: XOR<ConversationCreateWithoutContactInput, ConversationUncheckedCreateWithoutContactInput> | ConversationCreateWithoutContactInput[] | ConversationUncheckedCreateWithoutContactInput[]
    connectOrCreate?: ConversationCreateOrConnectWithoutContactInput | ConversationCreateOrConnectWithoutContactInput[]
    upsert?: ConversationUpsertWithWhereUniqueWithoutContactInput | ConversationUpsertWithWhereUniqueWithoutContactInput[]
    createMany?: ConversationCreateManyContactInputEnvelope
    set?: ConversationWhereUniqueInput | ConversationWhereUniqueInput[]
    disconnect?: ConversationWhereUniqueInput | ConversationWhereUniqueInput[]
    delete?: ConversationWhereUniqueInput | ConversationWhereUniqueInput[]
    connect?: ConversationWhereUniqueInput | ConversationWhereUniqueInput[]
    update?: ConversationUpdateWithWhereUniqueWithoutContactInput | ConversationUpdateWithWhereUniqueWithoutContactInput[]
    updateMany?: ConversationUpdateManyWithWhereWithoutContactInput | ConversationUpdateManyWithWhereWithoutContactInput[]
    deleteMany?: ConversationScalarWhereInput | ConversationScalarWhereInput[]
  }

  export type ConversationUncheckedUpdateManyWithoutContactNestedInput = {
    create?: XOR<ConversationCreateWithoutContactInput, ConversationUncheckedCreateWithoutContactInput> | ConversationCreateWithoutContactInput[] | ConversationUncheckedCreateWithoutContactInput[]
    connectOrCreate?: ConversationCreateOrConnectWithoutContactInput | ConversationCreateOrConnectWithoutContactInput[]
    upsert?: ConversationUpsertWithWhereUniqueWithoutContactInput | ConversationUpsertWithWhereUniqueWithoutContactInput[]
    createMany?: ConversationCreateManyContactInputEnvelope
    set?: ConversationWhereUniqueInput | ConversationWhereUniqueInput[]
    disconnect?: ConversationWhereUniqueInput | ConversationWhereUniqueInput[]
    delete?: ConversationWhereUniqueInput | ConversationWhereUniqueInput[]
    connect?: ConversationWhereUniqueInput | ConversationWhereUniqueInput[]
    update?: ConversationUpdateWithWhereUniqueWithoutContactInput | ConversationUpdateWithWhereUniqueWithoutContactInput[]
    updateMany?: ConversationUpdateManyWithWhereWithoutContactInput | ConversationUpdateManyWithWhereWithoutContactInput[]
    deleteMany?: ConversationScalarWhereInput | ConversationScalarWhereInput[]
  }

  export type ContactCreateNestedOneWithoutConversationsInput = {
    create?: XOR<ContactCreateWithoutConversationsInput, ContactUncheckedCreateWithoutConversationsInput>
    connectOrCreate?: ContactCreateOrConnectWithoutConversationsInput
    connect?: ContactWhereUniqueInput
  }

  export type DepartmentCreateNestedOneWithoutConversationsInput = {
    create?: XOR<DepartmentCreateWithoutConversationsInput, DepartmentUncheckedCreateWithoutConversationsInput>
    connectOrCreate?: DepartmentCreateOrConnectWithoutConversationsInput
    connect?: DepartmentWhereUniqueInput
  }

  export type AgentCreateNestedOneWithoutConversationsInput = {
    create?: XOR<AgentCreateWithoutConversationsInput, AgentUncheckedCreateWithoutConversationsInput>
    connectOrCreate?: AgentCreateOrConnectWithoutConversationsInput
    connect?: AgentWhereUniqueInput
  }

  export type MessageCreateNestedManyWithoutConversationInput = {
    create?: XOR<MessageCreateWithoutConversationInput, MessageUncheckedCreateWithoutConversationInput> | MessageCreateWithoutConversationInput[] | MessageUncheckedCreateWithoutConversationInput[]
    connectOrCreate?: MessageCreateOrConnectWithoutConversationInput | MessageCreateOrConnectWithoutConversationInput[]
    createMany?: MessageCreateManyConversationInputEnvelope
    connect?: MessageWhereUniqueInput | MessageWhereUniqueInput[]
  }

  export type MessageUncheckedCreateNestedManyWithoutConversationInput = {
    create?: XOR<MessageCreateWithoutConversationInput, MessageUncheckedCreateWithoutConversationInput> | MessageCreateWithoutConversationInput[] | MessageUncheckedCreateWithoutConversationInput[]
    connectOrCreate?: MessageCreateOrConnectWithoutConversationInput | MessageCreateOrConnectWithoutConversationInput[]
    createMany?: MessageCreateManyConversationInputEnvelope
    connect?: MessageWhereUniqueInput | MessageWhereUniqueInput[]
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type ContactUpdateOneRequiredWithoutConversationsNestedInput = {
    create?: XOR<ContactCreateWithoutConversationsInput, ContactUncheckedCreateWithoutConversationsInput>
    connectOrCreate?: ContactCreateOrConnectWithoutConversationsInput
    upsert?: ContactUpsertWithoutConversationsInput
    connect?: ContactWhereUniqueInput
    update?: XOR<XOR<ContactUpdateToOneWithWhereWithoutConversationsInput, ContactUpdateWithoutConversationsInput>, ContactUncheckedUpdateWithoutConversationsInput>
  }

  export type DepartmentUpdateOneWithoutConversationsNestedInput = {
    create?: XOR<DepartmentCreateWithoutConversationsInput, DepartmentUncheckedCreateWithoutConversationsInput>
    connectOrCreate?: DepartmentCreateOrConnectWithoutConversationsInput
    upsert?: DepartmentUpsertWithoutConversationsInput
    disconnect?: DepartmentWhereInput | boolean
    delete?: DepartmentWhereInput | boolean
    connect?: DepartmentWhereUniqueInput
    update?: XOR<XOR<DepartmentUpdateToOneWithWhereWithoutConversationsInput, DepartmentUpdateWithoutConversationsInput>, DepartmentUncheckedUpdateWithoutConversationsInput>
  }

  export type AgentUpdateOneWithoutConversationsNestedInput = {
    create?: XOR<AgentCreateWithoutConversationsInput, AgentUncheckedCreateWithoutConversationsInput>
    connectOrCreate?: AgentCreateOrConnectWithoutConversationsInput
    upsert?: AgentUpsertWithoutConversationsInput
    disconnect?: AgentWhereInput | boolean
    delete?: AgentWhereInput | boolean
    connect?: AgentWhereUniqueInput
    update?: XOR<XOR<AgentUpdateToOneWithWhereWithoutConversationsInput, AgentUpdateWithoutConversationsInput>, AgentUncheckedUpdateWithoutConversationsInput>
  }

  export type MessageUpdateManyWithoutConversationNestedInput = {
    create?: XOR<MessageCreateWithoutConversationInput, MessageUncheckedCreateWithoutConversationInput> | MessageCreateWithoutConversationInput[] | MessageUncheckedCreateWithoutConversationInput[]
    connectOrCreate?: MessageCreateOrConnectWithoutConversationInput | MessageCreateOrConnectWithoutConversationInput[]
    upsert?: MessageUpsertWithWhereUniqueWithoutConversationInput | MessageUpsertWithWhereUniqueWithoutConversationInput[]
    createMany?: MessageCreateManyConversationInputEnvelope
    set?: MessageWhereUniqueInput | MessageWhereUniqueInput[]
    disconnect?: MessageWhereUniqueInput | MessageWhereUniqueInput[]
    delete?: MessageWhereUniqueInput | MessageWhereUniqueInput[]
    connect?: MessageWhereUniqueInput | MessageWhereUniqueInput[]
    update?: MessageUpdateWithWhereUniqueWithoutConversationInput | MessageUpdateWithWhereUniqueWithoutConversationInput[]
    updateMany?: MessageUpdateManyWithWhereWithoutConversationInput | MessageUpdateManyWithWhereWithoutConversationInput[]
    deleteMany?: MessageScalarWhereInput | MessageScalarWhereInput[]
  }

  export type MessageUncheckedUpdateManyWithoutConversationNestedInput = {
    create?: XOR<MessageCreateWithoutConversationInput, MessageUncheckedCreateWithoutConversationInput> | MessageCreateWithoutConversationInput[] | MessageUncheckedCreateWithoutConversationInput[]
    connectOrCreate?: MessageCreateOrConnectWithoutConversationInput | MessageCreateOrConnectWithoutConversationInput[]
    upsert?: MessageUpsertWithWhereUniqueWithoutConversationInput | MessageUpsertWithWhereUniqueWithoutConversationInput[]
    createMany?: MessageCreateManyConversationInputEnvelope
    set?: MessageWhereUniqueInput | MessageWhereUniqueInput[]
    disconnect?: MessageWhereUniqueInput | MessageWhereUniqueInput[]
    delete?: MessageWhereUniqueInput | MessageWhereUniqueInput[]
    connect?: MessageWhereUniqueInput | MessageWhereUniqueInput[]
    update?: MessageUpdateWithWhereUniqueWithoutConversationInput | MessageUpdateWithWhereUniqueWithoutConversationInput[]
    updateMany?: MessageUpdateManyWithWhereWithoutConversationInput | MessageUpdateManyWithWhereWithoutConversationInput[]
    deleteMany?: MessageScalarWhereInput | MessageScalarWhereInput[]
  }

  export type ConversationCreateNestedOneWithoutMessagesInput = {
    create?: XOR<ConversationCreateWithoutMessagesInput, ConversationUncheckedCreateWithoutMessagesInput>
    connectOrCreate?: ConversationCreateOrConnectWithoutMessagesInput
    connect?: ConversationWhereUniqueInput
  }

  export type AgentCreateNestedOneWithoutMessagesInput = {
    create?: XOR<AgentCreateWithoutMessagesInput, AgentUncheckedCreateWithoutMessagesInput>
    connectOrCreate?: AgentCreateOrConnectWithoutMessagesInput
    connect?: AgentWhereUniqueInput
  }

  export type ConversationUpdateOneRequiredWithoutMessagesNestedInput = {
    create?: XOR<ConversationCreateWithoutMessagesInput, ConversationUncheckedCreateWithoutMessagesInput>
    connectOrCreate?: ConversationCreateOrConnectWithoutMessagesInput
    upsert?: ConversationUpsertWithoutMessagesInput
    connect?: ConversationWhereUniqueInput
    update?: XOR<XOR<ConversationUpdateToOneWithWhereWithoutMessagesInput, ConversationUpdateWithoutMessagesInput>, ConversationUncheckedUpdateWithoutMessagesInput>
  }

  export type AgentUpdateOneWithoutMessagesNestedInput = {
    create?: XOR<AgentCreateWithoutMessagesInput, AgentUncheckedCreateWithoutMessagesInput>
    connectOrCreate?: AgentCreateOrConnectWithoutMessagesInput
    upsert?: AgentUpsertWithoutMessagesInput
    disconnect?: AgentWhereInput | boolean
    delete?: AgentWhereInput | boolean
    connect?: AgentWhereUniqueInput
    update?: XOR<XOR<AgentUpdateToOneWithWhereWithoutMessagesInput, AgentUpdateWithoutMessagesInput>, AgentUncheckedUpdateWithoutMessagesInput>
  }

  export type DepartmentCreateNestedOneWithoutShortcutsInput = {
    create?: XOR<DepartmentCreateWithoutShortcutsInput, DepartmentUncheckedCreateWithoutShortcutsInput>
    connectOrCreate?: DepartmentCreateOrConnectWithoutShortcutsInput
    connect?: DepartmentWhereUniqueInput
  }

  export type AgentCreateNestedOneWithoutOwnedShortcutsInput = {
    create?: XOR<AgentCreateWithoutOwnedShortcutsInput, AgentUncheckedCreateWithoutOwnedShortcutsInput>
    connectOrCreate?: AgentCreateOrConnectWithoutOwnedShortcutsInput
    connect?: AgentWhereUniqueInput
  }

  export type AgentCreateNestedOneWithoutCreatedShortcutsInput = {
    create?: XOR<AgentCreateWithoutCreatedShortcutsInput, AgentUncheckedCreateWithoutCreatedShortcutsInput>
    connectOrCreate?: AgentCreateOrConnectWithoutCreatedShortcutsInput
    connect?: AgentWhereUniqueInput
  }

  export type AgentCreateNestedOneWithoutUpdatedShortcutsInput = {
    create?: XOR<AgentCreateWithoutUpdatedShortcutsInput, AgentUncheckedCreateWithoutUpdatedShortcutsInput>
    connectOrCreate?: AgentCreateOrConnectWithoutUpdatedShortcutsInput
    connect?: AgentWhereUniqueInput
  }

  export type ShortcutAuditCreateNestedManyWithoutShortcutInput = {
    create?: XOR<ShortcutAuditCreateWithoutShortcutInput, ShortcutAuditUncheckedCreateWithoutShortcutInput> | ShortcutAuditCreateWithoutShortcutInput[] | ShortcutAuditUncheckedCreateWithoutShortcutInput[]
    connectOrCreate?: ShortcutAuditCreateOrConnectWithoutShortcutInput | ShortcutAuditCreateOrConnectWithoutShortcutInput[]
    createMany?: ShortcutAuditCreateManyShortcutInputEnvelope
    connect?: ShortcutAuditWhereUniqueInput | ShortcutAuditWhereUniqueInput[]
  }

  export type ShortcutAuditUncheckedCreateNestedManyWithoutShortcutInput = {
    create?: XOR<ShortcutAuditCreateWithoutShortcutInput, ShortcutAuditUncheckedCreateWithoutShortcutInput> | ShortcutAuditCreateWithoutShortcutInput[] | ShortcutAuditUncheckedCreateWithoutShortcutInput[]
    connectOrCreate?: ShortcutAuditCreateOrConnectWithoutShortcutInput | ShortcutAuditCreateOrConnectWithoutShortcutInput[]
    createMany?: ShortcutAuditCreateManyShortcutInputEnvelope
    connect?: ShortcutAuditWhereUniqueInput | ShortcutAuditWhereUniqueInput[]
  }

  export type EnumShortcutTypeFieldUpdateOperationsInput = {
    set?: $Enums.ShortcutType
  }

  export type EnumShortcutScopeFieldUpdateOperationsInput = {
    set?: $Enums.ShortcutScope
  }

  export type DepartmentUpdateOneWithoutShortcutsNestedInput = {
    create?: XOR<DepartmentCreateWithoutShortcutsInput, DepartmentUncheckedCreateWithoutShortcutsInput>
    connectOrCreate?: DepartmentCreateOrConnectWithoutShortcutsInput
    upsert?: DepartmentUpsertWithoutShortcutsInput
    disconnect?: DepartmentWhereInput | boolean
    delete?: DepartmentWhereInput | boolean
    connect?: DepartmentWhereUniqueInput
    update?: XOR<XOR<DepartmentUpdateToOneWithWhereWithoutShortcutsInput, DepartmentUpdateWithoutShortcutsInput>, DepartmentUncheckedUpdateWithoutShortcutsInput>
  }

  export type AgentUpdateOneWithoutOwnedShortcutsNestedInput = {
    create?: XOR<AgentCreateWithoutOwnedShortcutsInput, AgentUncheckedCreateWithoutOwnedShortcutsInput>
    connectOrCreate?: AgentCreateOrConnectWithoutOwnedShortcutsInput
    upsert?: AgentUpsertWithoutOwnedShortcutsInput
    disconnect?: AgentWhereInput | boolean
    delete?: AgentWhereInput | boolean
    connect?: AgentWhereUniqueInput
    update?: XOR<XOR<AgentUpdateToOneWithWhereWithoutOwnedShortcutsInput, AgentUpdateWithoutOwnedShortcutsInput>, AgentUncheckedUpdateWithoutOwnedShortcutsInput>
  }

  export type AgentUpdateOneRequiredWithoutCreatedShortcutsNestedInput = {
    create?: XOR<AgentCreateWithoutCreatedShortcutsInput, AgentUncheckedCreateWithoutCreatedShortcutsInput>
    connectOrCreate?: AgentCreateOrConnectWithoutCreatedShortcutsInput
    upsert?: AgentUpsertWithoutCreatedShortcutsInput
    connect?: AgentWhereUniqueInput
    update?: XOR<XOR<AgentUpdateToOneWithWhereWithoutCreatedShortcutsInput, AgentUpdateWithoutCreatedShortcutsInput>, AgentUncheckedUpdateWithoutCreatedShortcutsInput>
  }

  export type AgentUpdateOneWithoutUpdatedShortcutsNestedInput = {
    create?: XOR<AgentCreateWithoutUpdatedShortcutsInput, AgentUncheckedCreateWithoutUpdatedShortcutsInput>
    connectOrCreate?: AgentCreateOrConnectWithoutUpdatedShortcutsInput
    upsert?: AgentUpsertWithoutUpdatedShortcutsInput
    disconnect?: AgentWhereInput | boolean
    delete?: AgentWhereInput | boolean
    connect?: AgentWhereUniqueInput
    update?: XOR<XOR<AgentUpdateToOneWithWhereWithoutUpdatedShortcutsInput, AgentUpdateWithoutUpdatedShortcutsInput>, AgentUncheckedUpdateWithoutUpdatedShortcutsInput>
  }

  export type ShortcutAuditUpdateManyWithoutShortcutNestedInput = {
    create?: XOR<ShortcutAuditCreateWithoutShortcutInput, ShortcutAuditUncheckedCreateWithoutShortcutInput> | ShortcutAuditCreateWithoutShortcutInput[] | ShortcutAuditUncheckedCreateWithoutShortcutInput[]
    connectOrCreate?: ShortcutAuditCreateOrConnectWithoutShortcutInput | ShortcutAuditCreateOrConnectWithoutShortcutInput[]
    upsert?: ShortcutAuditUpsertWithWhereUniqueWithoutShortcutInput | ShortcutAuditUpsertWithWhereUniqueWithoutShortcutInput[]
    createMany?: ShortcutAuditCreateManyShortcutInputEnvelope
    set?: ShortcutAuditWhereUniqueInput | ShortcutAuditWhereUniqueInput[]
    disconnect?: ShortcutAuditWhereUniqueInput | ShortcutAuditWhereUniqueInput[]
    delete?: ShortcutAuditWhereUniqueInput | ShortcutAuditWhereUniqueInput[]
    connect?: ShortcutAuditWhereUniqueInput | ShortcutAuditWhereUniqueInput[]
    update?: ShortcutAuditUpdateWithWhereUniqueWithoutShortcutInput | ShortcutAuditUpdateWithWhereUniqueWithoutShortcutInput[]
    updateMany?: ShortcutAuditUpdateManyWithWhereWithoutShortcutInput | ShortcutAuditUpdateManyWithWhereWithoutShortcutInput[]
    deleteMany?: ShortcutAuditScalarWhereInput | ShortcutAuditScalarWhereInput[]
  }

  export type ShortcutAuditUncheckedUpdateManyWithoutShortcutNestedInput = {
    create?: XOR<ShortcutAuditCreateWithoutShortcutInput, ShortcutAuditUncheckedCreateWithoutShortcutInput> | ShortcutAuditCreateWithoutShortcutInput[] | ShortcutAuditUncheckedCreateWithoutShortcutInput[]
    connectOrCreate?: ShortcutAuditCreateOrConnectWithoutShortcutInput | ShortcutAuditCreateOrConnectWithoutShortcutInput[]
    upsert?: ShortcutAuditUpsertWithWhereUniqueWithoutShortcutInput | ShortcutAuditUpsertWithWhereUniqueWithoutShortcutInput[]
    createMany?: ShortcutAuditCreateManyShortcutInputEnvelope
    set?: ShortcutAuditWhereUniqueInput | ShortcutAuditWhereUniqueInput[]
    disconnect?: ShortcutAuditWhereUniqueInput | ShortcutAuditWhereUniqueInput[]
    delete?: ShortcutAuditWhereUniqueInput | ShortcutAuditWhereUniqueInput[]
    connect?: ShortcutAuditWhereUniqueInput | ShortcutAuditWhereUniqueInput[]
    update?: ShortcutAuditUpdateWithWhereUniqueWithoutShortcutInput | ShortcutAuditUpdateWithWhereUniqueWithoutShortcutInput[]
    updateMany?: ShortcutAuditUpdateManyWithWhereWithoutShortcutInput | ShortcutAuditUpdateManyWithWhereWithoutShortcutInput[]
    deleteMany?: ShortcutAuditScalarWhereInput | ShortcutAuditScalarWhereInput[]
  }

  export type ShortcutCreateNestedOneWithoutAuditsInput = {
    create?: XOR<ShortcutCreateWithoutAuditsInput, ShortcutUncheckedCreateWithoutAuditsInput>
    connectOrCreate?: ShortcutCreateOrConnectWithoutAuditsInput
    connect?: ShortcutWhereUniqueInput
  }

  export type AgentCreateNestedOneWithoutShortcutAuditsInput = {
    create?: XOR<AgentCreateWithoutShortcutAuditsInput, AgentUncheckedCreateWithoutShortcutAuditsInput>
    connectOrCreate?: AgentCreateOrConnectWithoutShortcutAuditsInput
    connect?: AgentWhereUniqueInput
  }

  export type ShortcutUpdateOneWithoutAuditsNestedInput = {
    create?: XOR<ShortcutCreateWithoutAuditsInput, ShortcutUncheckedCreateWithoutAuditsInput>
    connectOrCreate?: ShortcutCreateOrConnectWithoutAuditsInput
    upsert?: ShortcutUpsertWithoutAuditsInput
    disconnect?: ShortcutWhereInput | boolean
    delete?: ShortcutWhereInput | boolean
    connect?: ShortcutWhereUniqueInput
    update?: XOR<XOR<ShortcutUpdateToOneWithWhereWithoutAuditsInput, ShortcutUpdateWithoutAuditsInput>, ShortcutUncheckedUpdateWithoutAuditsInput>
  }

  export type AgentUpdateOneRequiredWithoutShortcutAuditsNestedInput = {
    create?: XOR<AgentCreateWithoutShortcutAuditsInput, AgentUncheckedCreateWithoutShortcutAuditsInput>
    connectOrCreate?: AgentCreateOrConnectWithoutShortcutAuditsInput
    upsert?: AgentUpsertWithoutShortcutAuditsInput
    connect?: AgentWhereUniqueInput
    update?: XOR<XOR<AgentUpdateToOneWithWhereWithoutShortcutAuditsInput, AgentUpdateWithoutShortcutAuditsInput>, AgentUncheckedUpdateWithoutShortcutAuditsInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }
  export type NestedJsonFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<NestedJsonFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type NestedEnumShortcutTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.ShortcutType | EnumShortcutTypeFieldRefInput<$PrismaModel>
    in?: $Enums.ShortcutType[] | ListEnumShortcutTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.ShortcutType[] | ListEnumShortcutTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumShortcutTypeFilter<$PrismaModel> | $Enums.ShortcutType
  }

  export type NestedEnumShortcutScopeFilter<$PrismaModel = never> = {
    equals?: $Enums.ShortcutScope | EnumShortcutScopeFieldRefInput<$PrismaModel>
    in?: $Enums.ShortcutScope[] | ListEnumShortcutScopeFieldRefInput<$PrismaModel>
    notIn?: $Enums.ShortcutScope[] | ListEnumShortcutScopeFieldRefInput<$PrismaModel>
    not?: NestedEnumShortcutScopeFilter<$PrismaModel> | $Enums.ShortcutScope
  }

  export type NestedEnumShortcutTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ShortcutType | EnumShortcutTypeFieldRefInput<$PrismaModel>
    in?: $Enums.ShortcutType[] | ListEnumShortcutTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.ShortcutType[] | ListEnumShortcutTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumShortcutTypeWithAggregatesFilter<$PrismaModel> | $Enums.ShortcutType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumShortcutTypeFilter<$PrismaModel>
    _max?: NestedEnumShortcutTypeFilter<$PrismaModel>
  }

  export type NestedEnumShortcutScopeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ShortcutScope | EnumShortcutScopeFieldRefInput<$PrismaModel>
    in?: $Enums.ShortcutScope[] | ListEnumShortcutScopeFieldRefInput<$PrismaModel>
    notIn?: $Enums.ShortcutScope[] | ListEnumShortcutScopeFieldRefInput<$PrismaModel>
    not?: NestedEnumShortcutScopeWithAggregatesFilter<$PrismaModel> | $Enums.ShortcutScope
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumShortcutScopeFilter<$PrismaModel>
    _max?: NestedEnumShortcutScopeFilter<$PrismaModel>
  }
  export type NestedJsonNullableFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<NestedJsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type ProcedureCreateWithoutDepartmentInput = {
    id?: string
    title: string
    content: string
    order?: number
  }

  export type ProcedureUncheckedCreateWithoutDepartmentInput = {
    id?: string
    title: string
    content: string
    order?: number
  }

  export type ProcedureCreateOrConnectWithoutDepartmentInput = {
    where: ProcedureWhereUniqueInput
    create: XOR<ProcedureCreateWithoutDepartmentInput, ProcedureUncheckedCreateWithoutDepartmentInput>
  }

  export type ProcedureCreateManyDepartmentInputEnvelope = {
    data: ProcedureCreateManyDepartmentInput | ProcedureCreateManyDepartmentInput[]
    skipDuplicates?: boolean
  }

  export type AgentCreateWithoutDepartmentInput = {
    id?: string
    name: string
    email: string
    password?: string
    role?: string
    isActive?: boolean
    isOnline?: boolean
    createdAt?: Date | string
    conversations?: ConversationCreateNestedManyWithoutAssignedAgentInput
    messages?: MessageCreateNestedManyWithoutSenderAgentInput
    ownedShortcuts?: ShortcutCreateNestedManyWithoutOwnerInput
    createdShortcuts?: ShortcutCreateNestedManyWithoutCreatedByInput
    updatedShortcuts?: ShortcutCreateNestedManyWithoutUpdatedByInput
    shortcutAudits?: ShortcutAuditCreateNestedManyWithoutActorInput
  }

  export type AgentUncheckedCreateWithoutDepartmentInput = {
    id?: string
    name: string
    email: string
    password?: string
    role?: string
    isActive?: boolean
    isOnline?: boolean
    createdAt?: Date | string
    conversations?: ConversationUncheckedCreateNestedManyWithoutAssignedAgentInput
    messages?: MessageUncheckedCreateNestedManyWithoutSenderAgentInput
    ownedShortcuts?: ShortcutUncheckedCreateNestedManyWithoutOwnerInput
    createdShortcuts?: ShortcutUncheckedCreateNestedManyWithoutCreatedByInput
    updatedShortcuts?: ShortcutUncheckedCreateNestedManyWithoutUpdatedByInput
    shortcutAudits?: ShortcutAuditUncheckedCreateNestedManyWithoutActorInput
  }

  export type AgentCreateOrConnectWithoutDepartmentInput = {
    where: AgentWhereUniqueInput
    create: XOR<AgentCreateWithoutDepartmentInput, AgentUncheckedCreateWithoutDepartmentInput>
  }

  export type AgentCreateManyDepartmentInputEnvelope = {
    data: AgentCreateManyDepartmentInput | AgentCreateManyDepartmentInput[]
    skipDuplicates?: boolean
  }

  export type ConversationCreateWithoutDepartmentInput = {
    id?: string
    status?: string
    currentStep?: string | null
    startedAt?: Date | string
    closedAt?: Date | string | null
    contact: ContactCreateNestedOneWithoutConversationsInput
    assignedAgent?: AgentCreateNestedOneWithoutConversationsInput
    messages?: MessageCreateNestedManyWithoutConversationInput
  }

  export type ConversationUncheckedCreateWithoutDepartmentInput = {
    id?: string
    contactId: string
    status?: string
    assignedAgentId?: string | null
    currentStep?: string | null
    startedAt?: Date | string
    closedAt?: Date | string | null
    messages?: MessageUncheckedCreateNestedManyWithoutConversationInput
  }

  export type ConversationCreateOrConnectWithoutDepartmentInput = {
    where: ConversationWhereUniqueInput
    create: XOR<ConversationCreateWithoutDepartmentInput, ConversationUncheckedCreateWithoutDepartmentInput>
  }

  export type ConversationCreateManyDepartmentInputEnvelope = {
    data: ConversationCreateManyDepartmentInput | ConversationCreateManyDepartmentInput[]
    skipDuplicates?: boolean
  }

  export type ShortcutCreateWithoutDepartmentInput = {
    id?: string
    title: string
    message: string
    type: $Enums.ShortcutType
    scope: $Enums.ShortcutScope
    isActive?: boolean
    sortOrder?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    archivedAt?: Date | string | null
    owner?: AgentCreateNestedOneWithoutOwnedShortcutsInput
    createdBy: AgentCreateNestedOneWithoutCreatedShortcutsInput
    updatedBy?: AgentCreateNestedOneWithoutUpdatedShortcutsInput
    audits?: ShortcutAuditCreateNestedManyWithoutShortcutInput
  }

  export type ShortcutUncheckedCreateWithoutDepartmentInput = {
    id?: string
    title: string
    message: string
    type: $Enums.ShortcutType
    scope: $Enums.ShortcutScope
    ownerId?: string | null
    isActive?: boolean
    sortOrder?: number
    createdById: string
    updatedById?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    archivedAt?: Date | string | null
    audits?: ShortcutAuditUncheckedCreateNestedManyWithoutShortcutInput
  }

  export type ShortcutCreateOrConnectWithoutDepartmentInput = {
    where: ShortcutWhereUniqueInput
    create: XOR<ShortcutCreateWithoutDepartmentInput, ShortcutUncheckedCreateWithoutDepartmentInput>
  }

  export type ShortcutCreateManyDepartmentInputEnvelope = {
    data: ShortcutCreateManyDepartmentInput | ShortcutCreateManyDepartmentInput[]
    skipDuplicates?: boolean
  }

  export type ProcedureUpsertWithWhereUniqueWithoutDepartmentInput = {
    where: ProcedureWhereUniqueInput
    update: XOR<ProcedureUpdateWithoutDepartmentInput, ProcedureUncheckedUpdateWithoutDepartmentInput>
    create: XOR<ProcedureCreateWithoutDepartmentInput, ProcedureUncheckedCreateWithoutDepartmentInput>
  }

  export type ProcedureUpdateWithWhereUniqueWithoutDepartmentInput = {
    where: ProcedureWhereUniqueInput
    data: XOR<ProcedureUpdateWithoutDepartmentInput, ProcedureUncheckedUpdateWithoutDepartmentInput>
  }

  export type ProcedureUpdateManyWithWhereWithoutDepartmentInput = {
    where: ProcedureScalarWhereInput
    data: XOR<ProcedureUpdateManyMutationInput, ProcedureUncheckedUpdateManyWithoutDepartmentInput>
  }

  export type ProcedureScalarWhereInput = {
    AND?: ProcedureScalarWhereInput | ProcedureScalarWhereInput[]
    OR?: ProcedureScalarWhereInput[]
    NOT?: ProcedureScalarWhereInput | ProcedureScalarWhereInput[]
    id?: StringFilter<"Procedure"> | string
    departmentId?: StringFilter<"Procedure"> | string
    title?: StringFilter<"Procedure"> | string
    content?: StringFilter<"Procedure"> | string
    order?: IntFilter<"Procedure"> | number
  }

  export type AgentUpsertWithWhereUniqueWithoutDepartmentInput = {
    where: AgentWhereUniqueInput
    update: XOR<AgentUpdateWithoutDepartmentInput, AgentUncheckedUpdateWithoutDepartmentInput>
    create: XOR<AgentCreateWithoutDepartmentInput, AgentUncheckedCreateWithoutDepartmentInput>
  }

  export type AgentUpdateWithWhereUniqueWithoutDepartmentInput = {
    where: AgentWhereUniqueInput
    data: XOR<AgentUpdateWithoutDepartmentInput, AgentUncheckedUpdateWithoutDepartmentInput>
  }

  export type AgentUpdateManyWithWhereWithoutDepartmentInput = {
    where: AgentScalarWhereInput
    data: XOR<AgentUpdateManyMutationInput, AgentUncheckedUpdateManyWithoutDepartmentInput>
  }

  export type AgentScalarWhereInput = {
    AND?: AgentScalarWhereInput | AgentScalarWhereInput[]
    OR?: AgentScalarWhereInput[]
    NOT?: AgentScalarWhereInput | AgentScalarWhereInput[]
    id?: StringFilter<"Agent"> | string
    name?: StringFilter<"Agent"> | string
    email?: StringFilter<"Agent"> | string
    password?: StringFilter<"Agent"> | string
    role?: StringFilter<"Agent"> | string
    isActive?: BoolFilter<"Agent"> | boolean
    departmentId?: StringNullableFilter<"Agent"> | string | null
    isOnline?: BoolFilter<"Agent"> | boolean
    createdAt?: DateTimeFilter<"Agent"> | Date | string
  }

  export type ConversationUpsertWithWhereUniqueWithoutDepartmentInput = {
    where: ConversationWhereUniqueInput
    update: XOR<ConversationUpdateWithoutDepartmentInput, ConversationUncheckedUpdateWithoutDepartmentInput>
    create: XOR<ConversationCreateWithoutDepartmentInput, ConversationUncheckedCreateWithoutDepartmentInput>
  }

  export type ConversationUpdateWithWhereUniqueWithoutDepartmentInput = {
    where: ConversationWhereUniqueInput
    data: XOR<ConversationUpdateWithoutDepartmentInput, ConversationUncheckedUpdateWithoutDepartmentInput>
  }

  export type ConversationUpdateManyWithWhereWithoutDepartmentInput = {
    where: ConversationScalarWhereInput
    data: XOR<ConversationUpdateManyMutationInput, ConversationUncheckedUpdateManyWithoutDepartmentInput>
  }

  export type ConversationScalarWhereInput = {
    AND?: ConversationScalarWhereInput | ConversationScalarWhereInput[]
    OR?: ConversationScalarWhereInput[]
    NOT?: ConversationScalarWhereInput | ConversationScalarWhereInput[]
    id?: StringFilter<"Conversation"> | string
    contactId?: StringFilter<"Conversation"> | string
    status?: StringFilter<"Conversation"> | string
    departmentId?: StringNullableFilter<"Conversation"> | string | null
    assignedAgentId?: StringNullableFilter<"Conversation"> | string | null
    currentStep?: StringNullableFilter<"Conversation"> | string | null
    startedAt?: DateTimeFilter<"Conversation"> | Date | string
    closedAt?: DateTimeNullableFilter<"Conversation"> | Date | string | null
  }

  export type ShortcutUpsertWithWhereUniqueWithoutDepartmentInput = {
    where: ShortcutWhereUniqueInput
    update: XOR<ShortcutUpdateWithoutDepartmentInput, ShortcutUncheckedUpdateWithoutDepartmentInput>
    create: XOR<ShortcutCreateWithoutDepartmentInput, ShortcutUncheckedCreateWithoutDepartmentInput>
  }

  export type ShortcutUpdateWithWhereUniqueWithoutDepartmentInput = {
    where: ShortcutWhereUniqueInput
    data: XOR<ShortcutUpdateWithoutDepartmentInput, ShortcutUncheckedUpdateWithoutDepartmentInput>
  }

  export type ShortcutUpdateManyWithWhereWithoutDepartmentInput = {
    where: ShortcutScalarWhereInput
    data: XOR<ShortcutUpdateManyMutationInput, ShortcutUncheckedUpdateManyWithoutDepartmentInput>
  }

  export type ShortcutScalarWhereInput = {
    AND?: ShortcutScalarWhereInput | ShortcutScalarWhereInput[]
    OR?: ShortcutScalarWhereInput[]
    NOT?: ShortcutScalarWhereInput | ShortcutScalarWhereInput[]
    id?: StringFilter<"Shortcut"> | string
    title?: StringFilter<"Shortcut"> | string
    message?: StringFilter<"Shortcut"> | string
    type?: EnumShortcutTypeFilter<"Shortcut"> | $Enums.ShortcutType
    scope?: EnumShortcutScopeFilter<"Shortcut"> | $Enums.ShortcutScope
    departmentId?: StringNullableFilter<"Shortcut"> | string | null
    ownerId?: StringNullableFilter<"Shortcut"> | string | null
    isActive?: BoolFilter<"Shortcut"> | boolean
    sortOrder?: IntFilter<"Shortcut"> | number
    createdById?: StringFilter<"Shortcut"> | string
    updatedById?: StringNullableFilter<"Shortcut"> | string | null
    createdAt?: DateTimeFilter<"Shortcut"> | Date | string
    updatedAt?: DateTimeFilter<"Shortcut"> | Date | string
    archivedAt?: DateTimeNullableFilter<"Shortcut"> | Date | string | null
  }

  export type DepartmentCreateWithoutProceduresInput = {
    id?: string
    name: string
    description?: string | null
    createdAt?: Date | string
    agents?: AgentCreateNestedManyWithoutDepartmentInput
    conversations?: ConversationCreateNestedManyWithoutDepartmentInput
    shortcuts?: ShortcutCreateNestedManyWithoutDepartmentInput
  }

  export type DepartmentUncheckedCreateWithoutProceduresInput = {
    id?: string
    name: string
    description?: string | null
    createdAt?: Date | string
    agents?: AgentUncheckedCreateNestedManyWithoutDepartmentInput
    conversations?: ConversationUncheckedCreateNestedManyWithoutDepartmentInput
    shortcuts?: ShortcutUncheckedCreateNestedManyWithoutDepartmentInput
  }

  export type DepartmentCreateOrConnectWithoutProceduresInput = {
    where: DepartmentWhereUniqueInput
    create: XOR<DepartmentCreateWithoutProceduresInput, DepartmentUncheckedCreateWithoutProceduresInput>
  }

  export type DepartmentUpsertWithoutProceduresInput = {
    update: XOR<DepartmentUpdateWithoutProceduresInput, DepartmentUncheckedUpdateWithoutProceduresInput>
    create: XOR<DepartmentCreateWithoutProceduresInput, DepartmentUncheckedCreateWithoutProceduresInput>
    where?: DepartmentWhereInput
  }

  export type DepartmentUpdateToOneWithWhereWithoutProceduresInput = {
    where?: DepartmentWhereInput
    data: XOR<DepartmentUpdateWithoutProceduresInput, DepartmentUncheckedUpdateWithoutProceduresInput>
  }

  export type DepartmentUpdateWithoutProceduresInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    agents?: AgentUpdateManyWithoutDepartmentNestedInput
    conversations?: ConversationUpdateManyWithoutDepartmentNestedInput
    shortcuts?: ShortcutUpdateManyWithoutDepartmentNestedInput
  }

  export type DepartmentUncheckedUpdateWithoutProceduresInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    agents?: AgentUncheckedUpdateManyWithoutDepartmentNestedInput
    conversations?: ConversationUncheckedUpdateManyWithoutDepartmentNestedInput
    shortcuts?: ShortcutUncheckedUpdateManyWithoutDepartmentNestedInput
  }

  export type DepartmentCreateWithoutAgentsInput = {
    id?: string
    name: string
    description?: string | null
    createdAt?: Date | string
    procedures?: ProcedureCreateNestedManyWithoutDepartmentInput
    conversations?: ConversationCreateNestedManyWithoutDepartmentInput
    shortcuts?: ShortcutCreateNestedManyWithoutDepartmentInput
  }

  export type DepartmentUncheckedCreateWithoutAgentsInput = {
    id?: string
    name: string
    description?: string | null
    createdAt?: Date | string
    procedures?: ProcedureUncheckedCreateNestedManyWithoutDepartmentInput
    conversations?: ConversationUncheckedCreateNestedManyWithoutDepartmentInput
    shortcuts?: ShortcutUncheckedCreateNestedManyWithoutDepartmentInput
  }

  export type DepartmentCreateOrConnectWithoutAgentsInput = {
    where: DepartmentWhereUniqueInput
    create: XOR<DepartmentCreateWithoutAgentsInput, DepartmentUncheckedCreateWithoutAgentsInput>
  }

  export type ConversationCreateWithoutAssignedAgentInput = {
    id?: string
    status?: string
    currentStep?: string | null
    startedAt?: Date | string
    closedAt?: Date | string | null
    contact: ContactCreateNestedOneWithoutConversationsInput
    department?: DepartmentCreateNestedOneWithoutConversationsInput
    messages?: MessageCreateNestedManyWithoutConversationInput
  }

  export type ConversationUncheckedCreateWithoutAssignedAgentInput = {
    id?: string
    contactId: string
    status?: string
    departmentId?: string | null
    currentStep?: string | null
    startedAt?: Date | string
    closedAt?: Date | string | null
    messages?: MessageUncheckedCreateNestedManyWithoutConversationInput
  }

  export type ConversationCreateOrConnectWithoutAssignedAgentInput = {
    where: ConversationWhereUniqueInput
    create: XOR<ConversationCreateWithoutAssignedAgentInput, ConversationUncheckedCreateWithoutAssignedAgentInput>
  }

  export type ConversationCreateManyAssignedAgentInputEnvelope = {
    data: ConversationCreateManyAssignedAgentInput | ConversationCreateManyAssignedAgentInput[]
    skipDuplicates?: boolean
  }

  export type MessageCreateWithoutSenderAgentInput = {
    id?: string
    direction: string
    senderType: string
    content: string
    createdAt?: Date | string
    readAt?: Date | string | null
    conversation: ConversationCreateNestedOneWithoutMessagesInput
  }

  export type MessageUncheckedCreateWithoutSenderAgentInput = {
    id?: string
    conversationId: string
    direction: string
    senderType: string
    content: string
    createdAt?: Date | string
    readAt?: Date | string | null
  }

  export type MessageCreateOrConnectWithoutSenderAgentInput = {
    where: MessageWhereUniqueInput
    create: XOR<MessageCreateWithoutSenderAgentInput, MessageUncheckedCreateWithoutSenderAgentInput>
  }

  export type MessageCreateManySenderAgentInputEnvelope = {
    data: MessageCreateManySenderAgentInput | MessageCreateManySenderAgentInput[]
    skipDuplicates?: boolean
  }

  export type ShortcutCreateWithoutOwnerInput = {
    id?: string
    title: string
    message: string
    type: $Enums.ShortcutType
    scope: $Enums.ShortcutScope
    isActive?: boolean
    sortOrder?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    archivedAt?: Date | string | null
    department?: DepartmentCreateNestedOneWithoutShortcutsInput
    createdBy: AgentCreateNestedOneWithoutCreatedShortcutsInput
    updatedBy?: AgentCreateNestedOneWithoutUpdatedShortcutsInput
    audits?: ShortcutAuditCreateNestedManyWithoutShortcutInput
  }

  export type ShortcutUncheckedCreateWithoutOwnerInput = {
    id?: string
    title: string
    message: string
    type: $Enums.ShortcutType
    scope: $Enums.ShortcutScope
    departmentId?: string | null
    isActive?: boolean
    sortOrder?: number
    createdById: string
    updatedById?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    archivedAt?: Date | string | null
    audits?: ShortcutAuditUncheckedCreateNestedManyWithoutShortcutInput
  }

  export type ShortcutCreateOrConnectWithoutOwnerInput = {
    where: ShortcutWhereUniqueInput
    create: XOR<ShortcutCreateWithoutOwnerInput, ShortcutUncheckedCreateWithoutOwnerInput>
  }

  export type ShortcutCreateManyOwnerInputEnvelope = {
    data: ShortcutCreateManyOwnerInput | ShortcutCreateManyOwnerInput[]
    skipDuplicates?: boolean
  }

  export type ShortcutCreateWithoutCreatedByInput = {
    id?: string
    title: string
    message: string
    type: $Enums.ShortcutType
    scope: $Enums.ShortcutScope
    isActive?: boolean
    sortOrder?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    archivedAt?: Date | string | null
    department?: DepartmentCreateNestedOneWithoutShortcutsInput
    owner?: AgentCreateNestedOneWithoutOwnedShortcutsInput
    updatedBy?: AgentCreateNestedOneWithoutUpdatedShortcutsInput
    audits?: ShortcutAuditCreateNestedManyWithoutShortcutInput
  }

  export type ShortcutUncheckedCreateWithoutCreatedByInput = {
    id?: string
    title: string
    message: string
    type: $Enums.ShortcutType
    scope: $Enums.ShortcutScope
    departmentId?: string | null
    ownerId?: string | null
    isActive?: boolean
    sortOrder?: number
    updatedById?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    archivedAt?: Date | string | null
    audits?: ShortcutAuditUncheckedCreateNestedManyWithoutShortcutInput
  }

  export type ShortcutCreateOrConnectWithoutCreatedByInput = {
    where: ShortcutWhereUniqueInput
    create: XOR<ShortcutCreateWithoutCreatedByInput, ShortcutUncheckedCreateWithoutCreatedByInput>
  }

  export type ShortcutCreateManyCreatedByInputEnvelope = {
    data: ShortcutCreateManyCreatedByInput | ShortcutCreateManyCreatedByInput[]
    skipDuplicates?: boolean
  }

  export type ShortcutCreateWithoutUpdatedByInput = {
    id?: string
    title: string
    message: string
    type: $Enums.ShortcutType
    scope: $Enums.ShortcutScope
    isActive?: boolean
    sortOrder?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    archivedAt?: Date | string | null
    department?: DepartmentCreateNestedOneWithoutShortcutsInput
    owner?: AgentCreateNestedOneWithoutOwnedShortcutsInput
    createdBy: AgentCreateNestedOneWithoutCreatedShortcutsInput
    audits?: ShortcutAuditCreateNestedManyWithoutShortcutInput
  }

  export type ShortcutUncheckedCreateWithoutUpdatedByInput = {
    id?: string
    title: string
    message: string
    type: $Enums.ShortcutType
    scope: $Enums.ShortcutScope
    departmentId?: string | null
    ownerId?: string | null
    isActive?: boolean
    sortOrder?: number
    createdById: string
    createdAt?: Date | string
    updatedAt?: Date | string
    archivedAt?: Date | string | null
    audits?: ShortcutAuditUncheckedCreateNestedManyWithoutShortcutInput
  }

  export type ShortcutCreateOrConnectWithoutUpdatedByInput = {
    where: ShortcutWhereUniqueInput
    create: XOR<ShortcutCreateWithoutUpdatedByInput, ShortcutUncheckedCreateWithoutUpdatedByInput>
  }

  export type ShortcutCreateManyUpdatedByInputEnvelope = {
    data: ShortcutCreateManyUpdatedByInput | ShortcutCreateManyUpdatedByInput[]
    skipDuplicates?: boolean
  }

  export type ShortcutAuditCreateWithoutActorInput = {
    id?: string
    action: string
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    shortcut?: ShortcutCreateNestedOneWithoutAuditsInput
  }

  export type ShortcutAuditUncheckedCreateWithoutActorInput = {
    id?: string
    shortcutId?: string | null
    action: string
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
  }

  export type ShortcutAuditCreateOrConnectWithoutActorInput = {
    where: ShortcutAuditWhereUniqueInput
    create: XOR<ShortcutAuditCreateWithoutActorInput, ShortcutAuditUncheckedCreateWithoutActorInput>
  }

  export type ShortcutAuditCreateManyActorInputEnvelope = {
    data: ShortcutAuditCreateManyActorInput | ShortcutAuditCreateManyActorInput[]
    skipDuplicates?: boolean
  }

  export type DepartmentUpsertWithoutAgentsInput = {
    update: XOR<DepartmentUpdateWithoutAgentsInput, DepartmentUncheckedUpdateWithoutAgentsInput>
    create: XOR<DepartmentCreateWithoutAgentsInput, DepartmentUncheckedCreateWithoutAgentsInput>
    where?: DepartmentWhereInput
  }

  export type DepartmentUpdateToOneWithWhereWithoutAgentsInput = {
    where?: DepartmentWhereInput
    data: XOR<DepartmentUpdateWithoutAgentsInput, DepartmentUncheckedUpdateWithoutAgentsInput>
  }

  export type DepartmentUpdateWithoutAgentsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    procedures?: ProcedureUpdateManyWithoutDepartmentNestedInput
    conversations?: ConversationUpdateManyWithoutDepartmentNestedInput
    shortcuts?: ShortcutUpdateManyWithoutDepartmentNestedInput
  }

  export type DepartmentUncheckedUpdateWithoutAgentsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    procedures?: ProcedureUncheckedUpdateManyWithoutDepartmentNestedInput
    conversations?: ConversationUncheckedUpdateManyWithoutDepartmentNestedInput
    shortcuts?: ShortcutUncheckedUpdateManyWithoutDepartmentNestedInput
  }

  export type ConversationUpsertWithWhereUniqueWithoutAssignedAgentInput = {
    where: ConversationWhereUniqueInput
    update: XOR<ConversationUpdateWithoutAssignedAgentInput, ConversationUncheckedUpdateWithoutAssignedAgentInput>
    create: XOR<ConversationCreateWithoutAssignedAgentInput, ConversationUncheckedCreateWithoutAssignedAgentInput>
  }

  export type ConversationUpdateWithWhereUniqueWithoutAssignedAgentInput = {
    where: ConversationWhereUniqueInput
    data: XOR<ConversationUpdateWithoutAssignedAgentInput, ConversationUncheckedUpdateWithoutAssignedAgentInput>
  }

  export type ConversationUpdateManyWithWhereWithoutAssignedAgentInput = {
    where: ConversationScalarWhereInput
    data: XOR<ConversationUpdateManyMutationInput, ConversationUncheckedUpdateManyWithoutAssignedAgentInput>
  }

  export type MessageUpsertWithWhereUniqueWithoutSenderAgentInput = {
    where: MessageWhereUniqueInput
    update: XOR<MessageUpdateWithoutSenderAgentInput, MessageUncheckedUpdateWithoutSenderAgentInput>
    create: XOR<MessageCreateWithoutSenderAgentInput, MessageUncheckedCreateWithoutSenderAgentInput>
  }

  export type MessageUpdateWithWhereUniqueWithoutSenderAgentInput = {
    where: MessageWhereUniqueInput
    data: XOR<MessageUpdateWithoutSenderAgentInput, MessageUncheckedUpdateWithoutSenderAgentInput>
  }

  export type MessageUpdateManyWithWhereWithoutSenderAgentInput = {
    where: MessageScalarWhereInput
    data: XOR<MessageUpdateManyMutationInput, MessageUncheckedUpdateManyWithoutSenderAgentInput>
  }

  export type MessageScalarWhereInput = {
    AND?: MessageScalarWhereInput | MessageScalarWhereInput[]
    OR?: MessageScalarWhereInput[]
    NOT?: MessageScalarWhereInput | MessageScalarWhereInput[]
    id?: StringFilter<"Message"> | string
    conversationId?: StringFilter<"Message"> | string
    direction?: StringFilter<"Message"> | string
    senderType?: StringFilter<"Message"> | string
    senderAgentId?: StringNullableFilter<"Message"> | string | null
    content?: StringFilter<"Message"> | string
    createdAt?: DateTimeFilter<"Message"> | Date | string
    readAt?: DateTimeNullableFilter<"Message"> | Date | string | null
  }

  export type ShortcutUpsertWithWhereUniqueWithoutOwnerInput = {
    where: ShortcutWhereUniqueInput
    update: XOR<ShortcutUpdateWithoutOwnerInput, ShortcutUncheckedUpdateWithoutOwnerInput>
    create: XOR<ShortcutCreateWithoutOwnerInput, ShortcutUncheckedCreateWithoutOwnerInput>
  }

  export type ShortcutUpdateWithWhereUniqueWithoutOwnerInput = {
    where: ShortcutWhereUniqueInput
    data: XOR<ShortcutUpdateWithoutOwnerInput, ShortcutUncheckedUpdateWithoutOwnerInput>
  }

  export type ShortcutUpdateManyWithWhereWithoutOwnerInput = {
    where: ShortcutScalarWhereInput
    data: XOR<ShortcutUpdateManyMutationInput, ShortcutUncheckedUpdateManyWithoutOwnerInput>
  }

  export type ShortcutUpsertWithWhereUniqueWithoutCreatedByInput = {
    where: ShortcutWhereUniqueInput
    update: XOR<ShortcutUpdateWithoutCreatedByInput, ShortcutUncheckedUpdateWithoutCreatedByInput>
    create: XOR<ShortcutCreateWithoutCreatedByInput, ShortcutUncheckedCreateWithoutCreatedByInput>
  }

  export type ShortcutUpdateWithWhereUniqueWithoutCreatedByInput = {
    where: ShortcutWhereUniqueInput
    data: XOR<ShortcutUpdateWithoutCreatedByInput, ShortcutUncheckedUpdateWithoutCreatedByInput>
  }

  export type ShortcutUpdateManyWithWhereWithoutCreatedByInput = {
    where: ShortcutScalarWhereInput
    data: XOR<ShortcutUpdateManyMutationInput, ShortcutUncheckedUpdateManyWithoutCreatedByInput>
  }

  export type ShortcutUpsertWithWhereUniqueWithoutUpdatedByInput = {
    where: ShortcutWhereUniqueInput
    update: XOR<ShortcutUpdateWithoutUpdatedByInput, ShortcutUncheckedUpdateWithoutUpdatedByInput>
    create: XOR<ShortcutCreateWithoutUpdatedByInput, ShortcutUncheckedCreateWithoutUpdatedByInput>
  }

  export type ShortcutUpdateWithWhereUniqueWithoutUpdatedByInput = {
    where: ShortcutWhereUniqueInput
    data: XOR<ShortcutUpdateWithoutUpdatedByInput, ShortcutUncheckedUpdateWithoutUpdatedByInput>
  }

  export type ShortcutUpdateManyWithWhereWithoutUpdatedByInput = {
    where: ShortcutScalarWhereInput
    data: XOR<ShortcutUpdateManyMutationInput, ShortcutUncheckedUpdateManyWithoutUpdatedByInput>
  }

  export type ShortcutAuditUpsertWithWhereUniqueWithoutActorInput = {
    where: ShortcutAuditWhereUniqueInput
    update: XOR<ShortcutAuditUpdateWithoutActorInput, ShortcutAuditUncheckedUpdateWithoutActorInput>
    create: XOR<ShortcutAuditCreateWithoutActorInput, ShortcutAuditUncheckedCreateWithoutActorInput>
  }

  export type ShortcutAuditUpdateWithWhereUniqueWithoutActorInput = {
    where: ShortcutAuditWhereUniqueInput
    data: XOR<ShortcutAuditUpdateWithoutActorInput, ShortcutAuditUncheckedUpdateWithoutActorInput>
  }

  export type ShortcutAuditUpdateManyWithWhereWithoutActorInput = {
    where: ShortcutAuditScalarWhereInput
    data: XOR<ShortcutAuditUpdateManyMutationInput, ShortcutAuditUncheckedUpdateManyWithoutActorInput>
  }

  export type ShortcutAuditScalarWhereInput = {
    AND?: ShortcutAuditScalarWhereInput | ShortcutAuditScalarWhereInput[]
    OR?: ShortcutAuditScalarWhereInput[]
    NOT?: ShortcutAuditScalarWhereInput | ShortcutAuditScalarWhereInput[]
    id?: StringFilter<"ShortcutAudit"> | string
    shortcutId?: StringNullableFilter<"ShortcutAudit"> | string | null
    actorId?: StringFilter<"ShortcutAudit"> | string
    action?: StringFilter<"ShortcutAudit"> | string
    metadata?: JsonNullableFilter<"ShortcutAudit">
    createdAt?: DateTimeFilter<"ShortcutAudit"> | Date | string
  }

  export type ConversationCreateWithoutContactInput = {
    id?: string
    status?: string
    currentStep?: string | null
    startedAt?: Date | string
    closedAt?: Date | string | null
    department?: DepartmentCreateNestedOneWithoutConversationsInput
    assignedAgent?: AgentCreateNestedOneWithoutConversationsInput
    messages?: MessageCreateNestedManyWithoutConversationInput
  }

  export type ConversationUncheckedCreateWithoutContactInput = {
    id?: string
    status?: string
    departmentId?: string | null
    assignedAgentId?: string | null
    currentStep?: string | null
    startedAt?: Date | string
    closedAt?: Date | string | null
    messages?: MessageUncheckedCreateNestedManyWithoutConversationInput
  }

  export type ConversationCreateOrConnectWithoutContactInput = {
    where: ConversationWhereUniqueInput
    create: XOR<ConversationCreateWithoutContactInput, ConversationUncheckedCreateWithoutContactInput>
  }

  export type ConversationCreateManyContactInputEnvelope = {
    data: ConversationCreateManyContactInput | ConversationCreateManyContactInput[]
    skipDuplicates?: boolean
  }

  export type ConversationUpsertWithWhereUniqueWithoutContactInput = {
    where: ConversationWhereUniqueInput
    update: XOR<ConversationUpdateWithoutContactInput, ConversationUncheckedUpdateWithoutContactInput>
    create: XOR<ConversationCreateWithoutContactInput, ConversationUncheckedCreateWithoutContactInput>
  }

  export type ConversationUpdateWithWhereUniqueWithoutContactInput = {
    where: ConversationWhereUniqueInput
    data: XOR<ConversationUpdateWithoutContactInput, ConversationUncheckedUpdateWithoutContactInput>
  }

  export type ConversationUpdateManyWithWhereWithoutContactInput = {
    where: ConversationScalarWhereInput
    data: XOR<ConversationUpdateManyMutationInput, ConversationUncheckedUpdateManyWithoutContactInput>
  }

  export type ContactCreateWithoutConversationsInput = {
    id?: string
    phone: string
    name: string
    createdAt?: Date | string
  }

  export type ContactUncheckedCreateWithoutConversationsInput = {
    id?: string
    phone: string
    name: string
    createdAt?: Date | string
  }

  export type ContactCreateOrConnectWithoutConversationsInput = {
    where: ContactWhereUniqueInput
    create: XOR<ContactCreateWithoutConversationsInput, ContactUncheckedCreateWithoutConversationsInput>
  }

  export type DepartmentCreateWithoutConversationsInput = {
    id?: string
    name: string
    description?: string | null
    createdAt?: Date | string
    procedures?: ProcedureCreateNestedManyWithoutDepartmentInput
    agents?: AgentCreateNestedManyWithoutDepartmentInput
    shortcuts?: ShortcutCreateNestedManyWithoutDepartmentInput
  }

  export type DepartmentUncheckedCreateWithoutConversationsInput = {
    id?: string
    name: string
    description?: string | null
    createdAt?: Date | string
    procedures?: ProcedureUncheckedCreateNestedManyWithoutDepartmentInput
    agents?: AgentUncheckedCreateNestedManyWithoutDepartmentInput
    shortcuts?: ShortcutUncheckedCreateNestedManyWithoutDepartmentInput
  }

  export type DepartmentCreateOrConnectWithoutConversationsInput = {
    where: DepartmentWhereUniqueInput
    create: XOR<DepartmentCreateWithoutConversationsInput, DepartmentUncheckedCreateWithoutConversationsInput>
  }

  export type AgentCreateWithoutConversationsInput = {
    id?: string
    name: string
    email: string
    password?: string
    role?: string
    isActive?: boolean
    isOnline?: boolean
    createdAt?: Date | string
    department?: DepartmentCreateNestedOneWithoutAgentsInput
    messages?: MessageCreateNestedManyWithoutSenderAgentInput
    ownedShortcuts?: ShortcutCreateNestedManyWithoutOwnerInput
    createdShortcuts?: ShortcutCreateNestedManyWithoutCreatedByInput
    updatedShortcuts?: ShortcutCreateNestedManyWithoutUpdatedByInput
    shortcutAudits?: ShortcutAuditCreateNestedManyWithoutActorInput
  }

  export type AgentUncheckedCreateWithoutConversationsInput = {
    id?: string
    name: string
    email: string
    password?: string
    role?: string
    isActive?: boolean
    departmentId?: string | null
    isOnline?: boolean
    createdAt?: Date | string
    messages?: MessageUncheckedCreateNestedManyWithoutSenderAgentInput
    ownedShortcuts?: ShortcutUncheckedCreateNestedManyWithoutOwnerInput
    createdShortcuts?: ShortcutUncheckedCreateNestedManyWithoutCreatedByInput
    updatedShortcuts?: ShortcutUncheckedCreateNestedManyWithoutUpdatedByInput
    shortcutAudits?: ShortcutAuditUncheckedCreateNestedManyWithoutActorInput
  }

  export type AgentCreateOrConnectWithoutConversationsInput = {
    where: AgentWhereUniqueInput
    create: XOR<AgentCreateWithoutConversationsInput, AgentUncheckedCreateWithoutConversationsInput>
  }

  export type MessageCreateWithoutConversationInput = {
    id?: string
    direction: string
    senderType: string
    content: string
    createdAt?: Date | string
    readAt?: Date | string | null
    senderAgent?: AgentCreateNestedOneWithoutMessagesInput
  }

  export type MessageUncheckedCreateWithoutConversationInput = {
    id?: string
    direction: string
    senderType: string
    senderAgentId?: string | null
    content: string
    createdAt?: Date | string
    readAt?: Date | string | null
  }

  export type MessageCreateOrConnectWithoutConversationInput = {
    where: MessageWhereUniqueInput
    create: XOR<MessageCreateWithoutConversationInput, MessageUncheckedCreateWithoutConversationInput>
  }

  export type MessageCreateManyConversationInputEnvelope = {
    data: MessageCreateManyConversationInput | MessageCreateManyConversationInput[]
    skipDuplicates?: boolean
  }

  export type ContactUpsertWithoutConversationsInput = {
    update: XOR<ContactUpdateWithoutConversationsInput, ContactUncheckedUpdateWithoutConversationsInput>
    create: XOR<ContactCreateWithoutConversationsInput, ContactUncheckedCreateWithoutConversationsInput>
    where?: ContactWhereInput
  }

  export type ContactUpdateToOneWithWhereWithoutConversationsInput = {
    where?: ContactWhereInput
    data: XOR<ContactUpdateWithoutConversationsInput, ContactUncheckedUpdateWithoutConversationsInput>
  }

  export type ContactUpdateWithoutConversationsInput = {
    id?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ContactUncheckedUpdateWithoutConversationsInput = {
    id?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DepartmentUpsertWithoutConversationsInput = {
    update: XOR<DepartmentUpdateWithoutConversationsInput, DepartmentUncheckedUpdateWithoutConversationsInput>
    create: XOR<DepartmentCreateWithoutConversationsInput, DepartmentUncheckedCreateWithoutConversationsInput>
    where?: DepartmentWhereInput
  }

  export type DepartmentUpdateToOneWithWhereWithoutConversationsInput = {
    where?: DepartmentWhereInput
    data: XOR<DepartmentUpdateWithoutConversationsInput, DepartmentUncheckedUpdateWithoutConversationsInput>
  }

  export type DepartmentUpdateWithoutConversationsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    procedures?: ProcedureUpdateManyWithoutDepartmentNestedInput
    agents?: AgentUpdateManyWithoutDepartmentNestedInput
    shortcuts?: ShortcutUpdateManyWithoutDepartmentNestedInput
  }

  export type DepartmentUncheckedUpdateWithoutConversationsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    procedures?: ProcedureUncheckedUpdateManyWithoutDepartmentNestedInput
    agents?: AgentUncheckedUpdateManyWithoutDepartmentNestedInput
    shortcuts?: ShortcutUncheckedUpdateManyWithoutDepartmentNestedInput
  }

  export type AgentUpsertWithoutConversationsInput = {
    update: XOR<AgentUpdateWithoutConversationsInput, AgentUncheckedUpdateWithoutConversationsInput>
    create: XOR<AgentCreateWithoutConversationsInput, AgentUncheckedCreateWithoutConversationsInput>
    where?: AgentWhereInput
  }

  export type AgentUpdateToOneWithWhereWithoutConversationsInput = {
    where?: AgentWhereInput
    data: XOR<AgentUpdateWithoutConversationsInput, AgentUncheckedUpdateWithoutConversationsInput>
  }

  export type AgentUpdateWithoutConversationsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    isOnline?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    department?: DepartmentUpdateOneWithoutAgentsNestedInput
    messages?: MessageUpdateManyWithoutSenderAgentNestedInput
    ownedShortcuts?: ShortcutUpdateManyWithoutOwnerNestedInput
    createdShortcuts?: ShortcutUpdateManyWithoutCreatedByNestedInput
    updatedShortcuts?: ShortcutUpdateManyWithoutUpdatedByNestedInput
    shortcutAudits?: ShortcutAuditUpdateManyWithoutActorNestedInput
  }

  export type AgentUncheckedUpdateWithoutConversationsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    departmentId?: NullableStringFieldUpdateOperationsInput | string | null
    isOnline?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    messages?: MessageUncheckedUpdateManyWithoutSenderAgentNestedInput
    ownedShortcuts?: ShortcutUncheckedUpdateManyWithoutOwnerNestedInput
    createdShortcuts?: ShortcutUncheckedUpdateManyWithoutCreatedByNestedInput
    updatedShortcuts?: ShortcutUncheckedUpdateManyWithoutUpdatedByNestedInput
    shortcutAudits?: ShortcutAuditUncheckedUpdateManyWithoutActorNestedInput
  }

  export type MessageUpsertWithWhereUniqueWithoutConversationInput = {
    where: MessageWhereUniqueInput
    update: XOR<MessageUpdateWithoutConversationInput, MessageUncheckedUpdateWithoutConversationInput>
    create: XOR<MessageCreateWithoutConversationInput, MessageUncheckedCreateWithoutConversationInput>
  }

  export type MessageUpdateWithWhereUniqueWithoutConversationInput = {
    where: MessageWhereUniqueInput
    data: XOR<MessageUpdateWithoutConversationInput, MessageUncheckedUpdateWithoutConversationInput>
  }

  export type MessageUpdateManyWithWhereWithoutConversationInput = {
    where: MessageScalarWhereInput
    data: XOR<MessageUpdateManyMutationInput, MessageUncheckedUpdateManyWithoutConversationInput>
  }

  export type ConversationCreateWithoutMessagesInput = {
    id?: string
    status?: string
    currentStep?: string | null
    startedAt?: Date | string
    closedAt?: Date | string | null
    contact: ContactCreateNestedOneWithoutConversationsInput
    department?: DepartmentCreateNestedOneWithoutConversationsInput
    assignedAgent?: AgentCreateNestedOneWithoutConversationsInput
  }

  export type ConversationUncheckedCreateWithoutMessagesInput = {
    id?: string
    contactId: string
    status?: string
    departmentId?: string | null
    assignedAgentId?: string | null
    currentStep?: string | null
    startedAt?: Date | string
    closedAt?: Date | string | null
  }

  export type ConversationCreateOrConnectWithoutMessagesInput = {
    where: ConversationWhereUniqueInput
    create: XOR<ConversationCreateWithoutMessagesInput, ConversationUncheckedCreateWithoutMessagesInput>
  }

  export type AgentCreateWithoutMessagesInput = {
    id?: string
    name: string
    email: string
    password?: string
    role?: string
    isActive?: boolean
    isOnline?: boolean
    createdAt?: Date | string
    department?: DepartmentCreateNestedOneWithoutAgentsInput
    conversations?: ConversationCreateNestedManyWithoutAssignedAgentInput
    ownedShortcuts?: ShortcutCreateNestedManyWithoutOwnerInput
    createdShortcuts?: ShortcutCreateNestedManyWithoutCreatedByInput
    updatedShortcuts?: ShortcutCreateNestedManyWithoutUpdatedByInput
    shortcutAudits?: ShortcutAuditCreateNestedManyWithoutActorInput
  }

  export type AgentUncheckedCreateWithoutMessagesInput = {
    id?: string
    name: string
    email: string
    password?: string
    role?: string
    isActive?: boolean
    departmentId?: string | null
    isOnline?: boolean
    createdAt?: Date | string
    conversations?: ConversationUncheckedCreateNestedManyWithoutAssignedAgentInput
    ownedShortcuts?: ShortcutUncheckedCreateNestedManyWithoutOwnerInput
    createdShortcuts?: ShortcutUncheckedCreateNestedManyWithoutCreatedByInput
    updatedShortcuts?: ShortcutUncheckedCreateNestedManyWithoutUpdatedByInput
    shortcutAudits?: ShortcutAuditUncheckedCreateNestedManyWithoutActorInput
  }

  export type AgentCreateOrConnectWithoutMessagesInput = {
    where: AgentWhereUniqueInput
    create: XOR<AgentCreateWithoutMessagesInput, AgentUncheckedCreateWithoutMessagesInput>
  }

  export type ConversationUpsertWithoutMessagesInput = {
    update: XOR<ConversationUpdateWithoutMessagesInput, ConversationUncheckedUpdateWithoutMessagesInput>
    create: XOR<ConversationCreateWithoutMessagesInput, ConversationUncheckedCreateWithoutMessagesInput>
    where?: ConversationWhereInput
  }

  export type ConversationUpdateToOneWithWhereWithoutMessagesInput = {
    where?: ConversationWhereInput
    data: XOR<ConversationUpdateWithoutMessagesInput, ConversationUncheckedUpdateWithoutMessagesInput>
  }

  export type ConversationUpdateWithoutMessagesInput = {
    id?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    currentStep?: NullableStringFieldUpdateOperationsInput | string | null
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    closedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    contact?: ContactUpdateOneRequiredWithoutConversationsNestedInput
    department?: DepartmentUpdateOneWithoutConversationsNestedInput
    assignedAgent?: AgentUpdateOneWithoutConversationsNestedInput
  }

  export type ConversationUncheckedUpdateWithoutMessagesInput = {
    id?: StringFieldUpdateOperationsInput | string
    contactId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    departmentId?: NullableStringFieldUpdateOperationsInput | string | null
    assignedAgentId?: NullableStringFieldUpdateOperationsInput | string | null
    currentStep?: NullableStringFieldUpdateOperationsInput | string | null
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    closedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type AgentUpsertWithoutMessagesInput = {
    update: XOR<AgentUpdateWithoutMessagesInput, AgentUncheckedUpdateWithoutMessagesInput>
    create: XOR<AgentCreateWithoutMessagesInput, AgentUncheckedCreateWithoutMessagesInput>
    where?: AgentWhereInput
  }

  export type AgentUpdateToOneWithWhereWithoutMessagesInput = {
    where?: AgentWhereInput
    data: XOR<AgentUpdateWithoutMessagesInput, AgentUncheckedUpdateWithoutMessagesInput>
  }

  export type AgentUpdateWithoutMessagesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    isOnline?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    department?: DepartmentUpdateOneWithoutAgentsNestedInput
    conversations?: ConversationUpdateManyWithoutAssignedAgentNestedInput
    ownedShortcuts?: ShortcutUpdateManyWithoutOwnerNestedInput
    createdShortcuts?: ShortcutUpdateManyWithoutCreatedByNestedInput
    updatedShortcuts?: ShortcutUpdateManyWithoutUpdatedByNestedInput
    shortcutAudits?: ShortcutAuditUpdateManyWithoutActorNestedInput
  }

  export type AgentUncheckedUpdateWithoutMessagesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    departmentId?: NullableStringFieldUpdateOperationsInput | string | null
    isOnline?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    conversations?: ConversationUncheckedUpdateManyWithoutAssignedAgentNestedInput
    ownedShortcuts?: ShortcutUncheckedUpdateManyWithoutOwnerNestedInput
    createdShortcuts?: ShortcutUncheckedUpdateManyWithoutCreatedByNestedInput
    updatedShortcuts?: ShortcutUncheckedUpdateManyWithoutUpdatedByNestedInput
    shortcutAudits?: ShortcutAuditUncheckedUpdateManyWithoutActorNestedInput
  }

  export type DepartmentCreateWithoutShortcutsInput = {
    id?: string
    name: string
    description?: string | null
    createdAt?: Date | string
    procedures?: ProcedureCreateNestedManyWithoutDepartmentInput
    agents?: AgentCreateNestedManyWithoutDepartmentInput
    conversations?: ConversationCreateNestedManyWithoutDepartmentInput
  }

  export type DepartmentUncheckedCreateWithoutShortcutsInput = {
    id?: string
    name: string
    description?: string | null
    createdAt?: Date | string
    procedures?: ProcedureUncheckedCreateNestedManyWithoutDepartmentInput
    agents?: AgentUncheckedCreateNestedManyWithoutDepartmentInput
    conversations?: ConversationUncheckedCreateNestedManyWithoutDepartmentInput
  }

  export type DepartmentCreateOrConnectWithoutShortcutsInput = {
    where: DepartmentWhereUniqueInput
    create: XOR<DepartmentCreateWithoutShortcutsInput, DepartmentUncheckedCreateWithoutShortcutsInput>
  }

  export type AgentCreateWithoutOwnedShortcutsInput = {
    id?: string
    name: string
    email: string
    password?: string
    role?: string
    isActive?: boolean
    isOnline?: boolean
    createdAt?: Date | string
    department?: DepartmentCreateNestedOneWithoutAgentsInput
    conversations?: ConversationCreateNestedManyWithoutAssignedAgentInput
    messages?: MessageCreateNestedManyWithoutSenderAgentInput
    createdShortcuts?: ShortcutCreateNestedManyWithoutCreatedByInput
    updatedShortcuts?: ShortcutCreateNestedManyWithoutUpdatedByInput
    shortcutAudits?: ShortcutAuditCreateNestedManyWithoutActorInput
  }

  export type AgentUncheckedCreateWithoutOwnedShortcutsInput = {
    id?: string
    name: string
    email: string
    password?: string
    role?: string
    isActive?: boolean
    departmentId?: string | null
    isOnline?: boolean
    createdAt?: Date | string
    conversations?: ConversationUncheckedCreateNestedManyWithoutAssignedAgentInput
    messages?: MessageUncheckedCreateNestedManyWithoutSenderAgentInput
    createdShortcuts?: ShortcutUncheckedCreateNestedManyWithoutCreatedByInput
    updatedShortcuts?: ShortcutUncheckedCreateNestedManyWithoutUpdatedByInput
    shortcutAudits?: ShortcutAuditUncheckedCreateNestedManyWithoutActorInput
  }

  export type AgentCreateOrConnectWithoutOwnedShortcutsInput = {
    where: AgentWhereUniqueInput
    create: XOR<AgentCreateWithoutOwnedShortcutsInput, AgentUncheckedCreateWithoutOwnedShortcutsInput>
  }

  export type AgentCreateWithoutCreatedShortcutsInput = {
    id?: string
    name: string
    email: string
    password?: string
    role?: string
    isActive?: boolean
    isOnline?: boolean
    createdAt?: Date | string
    department?: DepartmentCreateNestedOneWithoutAgentsInput
    conversations?: ConversationCreateNestedManyWithoutAssignedAgentInput
    messages?: MessageCreateNestedManyWithoutSenderAgentInput
    ownedShortcuts?: ShortcutCreateNestedManyWithoutOwnerInput
    updatedShortcuts?: ShortcutCreateNestedManyWithoutUpdatedByInput
    shortcutAudits?: ShortcutAuditCreateNestedManyWithoutActorInput
  }

  export type AgentUncheckedCreateWithoutCreatedShortcutsInput = {
    id?: string
    name: string
    email: string
    password?: string
    role?: string
    isActive?: boolean
    departmentId?: string | null
    isOnline?: boolean
    createdAt?: Date | string
    conversations?: ConversationUncheckedCreateNestedManyWithoutAssignedAgentInput
    messages?: MessageUncheckedCreateNestedManyWithoutSenderAgentInput
    ownedShortcuts?: ShortcutUncheckedCreateNestedManyWithoutOwnerInput
    updatedShortcuts?: ShortcutUncheckedCreateNestedManyWithoutUpdatedByInput
    shortcutAudits?: ShortcutAuditUncheckedCreateNestedManyWithoutActorInput
  }

  export type AgentCreateOrConnectWithoutCreatedShortcutsInput = {
    where: AgentWhereUniqueInput
    create: XOR<AgentCreateWithoutCreatedShortcutsInput, AgentUncheckedCreateWithoutCreatedShortcutsInput>
  }

  export type AgentCreateWithoutUpdatedShortcutsInput = {
    id?: string
    name: string
    email: string
    password?: string
    role?: string
    isActive?: boolean
    isOnline?: boolean
    createdAt?: Date | string
    department?: DepartmentCreateNestedOneWithoutAgentsInput
    conversations?: ConversationCreateNestedManyWithoutAssignedAgentInput
    messages?: MessageCreateNestedManyWithoutSenderAgentInput
    ownedShortcuts?: ShortcutCreateNestedManyWithoutOwnerInput
    createdShortcuts?: ShortcutCreateNestedManyWithoutCreatedByInput
    shortcutAudits?: ShortcutAuditCreateNestedManyWithoutActorInput
  }

  export type AgentUncheckedCreateWithoutUpdatedShortcutsInput = {
    id?: string
    name: string
    email: string
    password?: string
    role?: string
    isActive?: boolean
    departmentId?: string | null
    isOnline?: boolean
    createdAt?: Date | string
    conversations?: ConversationUncheckedCreateNestedManyWithoutAssignedAgentInput
    messages?: MessageUncheckedCreateNestedManyWithoutSenderAgentInput
    ownedShortcuts?: ShortcutUncheckedCreateNestedManyWithoutOwnerInput
    createdShortcuts?: ShortcutUncheckedCreateNestedManyWithoutCreatedByInput
    shortcutAudits?: ShortcutAuditUncheckedCreateNestedManyWithoutActorInput
  }

  export type AgentCreateOrConnectWithoutUpdatedShortcutsInput = {
    where: AgentWhereUniqueInput
    create: XOR<AgentCreateWithoutUpdatedShortcutsInput, AgentUncheckedCreateWithoutUpdatedShortcutsInput>
  }

  export type ShortcutAuditCreateWithoutShortcutInput = {
    id?: string
    action: string
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    actor: AgentCreateNestedOneWithoutShortcutAuditsInput
  }

  export type ShortcutAuditUncheckedCreateWithoutShortcutInput = {
    id?: string
    actorId: string
    action: string
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
  }

  export type ShortcutAuditCreateOrConnectWithoutShortcutInput = {
    where: ShortcutAuditWhereUniqueInput
    create: XOR<ShortcutAuditCreateWithoutShortcutInput, ShortcutAuditUncheckedCreateWithoutShortcutInput>
  }

  export type ShortcutAuditCreateManyShortcutInputEnvelope = {
    data: ShortcutAuditCreateManyShortcutInput | ShortcutAuditCreateManyShortcutInput[]
    skipDuplicates?: boolean
  }

  export type DepartmentUpsertWithoutShortcutsInput = {
    update: XOR<DepartmentUpdateWithoutShortcutsInput, DepartmentUncheckedUpdateWithoutShortcutsInput>
    create: XOR<DepartmentCreateWithoutShortcutsInput, DepartmentUncheckedCreateWithoutShortcutsInput>
    where?: DepartmentWhereInput
  }

  export type DepartmentUpdateToOneWithWhereWithoutShortcutsInput = {
    where?: DepartmentWhereInput
    data: XOR<DepartmentUpdateWithoutShortcutsInput, DepartmentUncheckedUpdateWithoutShortcutsInput>
  }

  export type DepartmentUpdateWithoutShortcutsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    procedures?: ProcedureUpdateManyWithoutDepartmentNestedInput
    agents?: AgentUpdateManyWithoutDepartmentNestedInput
    conversations?: ConversationUpdateManyWithoutDepartmentNestedInput
  }

  export type DepartmentUncheckedUpdateWithoutShortcutsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    procedures?: ProcedureUncheckedUpdateManyWithoutDepartmentNestedInput
    agents?: AgentUncheckedUpdateManyWithoutDepartmentNestedInput
    conversations?: ConversationUncheckedUpdateManyWithoutDepartmentNestedInput
  }

  export type AgentUpsertWithoutOwnedShortcutsInput = {
    update: XOR<AgentUpdateWithoutOwnedShortcutsInput, AgentUncheckedUpdateWithoutOwnedShortcutsInput>
    create: XOR<AgentCreateWithoutOwnedShortcutsInput, AgentUncheckedCreateWithoutOwnedShortcutsInput>
    where?: AgentWhereInput
  }

  export type AgentUpdateToOneWithWhereWithoutOwnedShortcutsInput = {
    where?: AgentWhereInput
    data: XOR<AgentUpdateWithoutOwnedShortcutsInput, AgentUncheckedUpdateWithoutOwnedShortcutsInput>
  }

  export type AgentUpdateWithoutOwnedShortcutsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    isOnline?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    department?: DepartmentUpdateOneWithoutAgentsNestedInput
    conversations?: ConversationUpdateManyWithoutAssignedAgentNestedInput
    messages?: MessageUpdateManyWithoutSenderAgentNestedInput
    createdShortcuts?: ShortcutUpdateManyWithoutCreatedByNestedInput
    updatedShortcuts?: ShortcutUpdateManyWithoutUpdatedByNestedInput
    shortcutAudits?: ShortcutAuditUpdateManyWithoutActorNestedInput
  }

  export type AgentUncheckedUpdateWithoutOwnedShortcutsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    departmentId?: NullableStringFieldUpdateOperationsInput | string | null
    isOnline?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    conversations?: ConversationUncheckedUpdateManyWithoutAssignedAgentNestedInput
    messages?: MessageUncheckedUpdateManyWithoutSenderAgentNestedInput
    createdShortcuts?: ShortcutUncheckedUpdateManyWithoutCreatedByNestedInput
    updatedShortcuts?: ShortcutUncheckedUpdateManyWithoutUpdatedByNestedInput
    shortcutAudits?: ShortcutAuditUncheckedUpdateManyWithoutActorNestedInput
  }

  export type AgentUpsertWithoutCreatedShortcutsInput = {
    update: XOR<AgentUpdateWithoutCreatedShortcutsInput, AgentUncheckedUpdateWithoutCreatedShortcutsInput>
    create: XOR<AgentCreateWithoutCreatedShortcutsInput, AgentUncheckedCreateWithoutCreatedShortcutsInput>
    where?: AgentWhereInput
  }

  export type AgentUpdateToOneWithWhereWithoutCreatedShortcutsInput = {
    where?: AgentWhereInput
    data: XOR<AgentUpdateWithoutCreatedShortcutsInput, AgentUncheckedUpdateWithoutCreatedShortcutsInput>
  }

  export type AgentUpdateWithoutCreatedShortcutsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    isOnline?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    department?: DepartmentUpdateOneWithoutAgentsNestedInput
    conversations?: ConversationUpdateManyWithoutAssignedAgentNestedInput
    messages?: MessageUpdateManyWithoutSenderAgentNestedInput
    ownedShortcuts?: ShortcutUpdateManyWithoutOwnerNestedInput
    updatedShortcuts?: ShortcutUpdateManyWithoutUpdatedByNestedInput
    shortcutAudits?: ShortcutAuditUpdateManyWithoutActorNestedInput
  }

  export type AgentUncheckedUpdateWithoutCreatedShortcutsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    departmentId?: NullableStringFieldUpdateOperationsInput | string | null
    isOnline?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    conversations?: ConversationUncheckedUpdateManyWithoutAssignedAgentNestedInput
    messages?: MessageUncheckedUpdateManyWithoutSenderAgentNestedInput
    ownedShortcuts?: ShortcutUncheckedUpdateManyWithoutOwnerNestedInput
    updatedShortcuts?: ShortcutUncheckedUpdateManyWithoutUpdatedByNestedInput
    shortcutAudits?: ShortcutAuditUncheckedUpdateManyWithoutActorNestedInput
  }

  export type AgentUpsertWithoutUpdatedShortcutsInput = {
    update: XOR<AgentUpdateWithoutUpdatedShortcutsInput, AgentUncheckedUpdateWithoutUpdatedShortcutsInput>
    create: XOR<AgentCreateWithoutUpdatedShortcutsInput, AgentUncheckedCreateWithoutUpdatedShortcutsInput>
    where?: AgentWhereInput
  }

  export type AgentUpdateToOneWithWhereWithoutUpdatedShortcutsInput = {
    where?: AgentWhereInput
    data: XOR<AgentUpdateWithoutUpdatedShortcutsInput, AgentUncheckedUpdateWithoutUpdatedShortcutsInput>
  }

  export type AgentUpdateWithoutUpdatedShortcutsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    isOnline?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    department?: DepartmentUpdateOneWithoutAgentsNestedInput
    conversations?: ConversationUpdateManyWithoutAssignedAgentNestedInput
    messages?: MessageUpdateManyWithoutSenderAgentNestedInput
    ownedShortcuts?: ShortcutUpdateManyWithoutOwnerNestedInput
    createdShortcuts?: ShortcutUpdateManyWithoutCreatedByNestedInput
    shortcutAudits?: ShortcutAuditUpdateManyWithoutActorNestedInput
  }

  export type AgentUncheckedUpdateWithoutUpdatedShortcutsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    departmentId?: NullableStringFieldUpdateOperationsInput | string | null
    isOnline?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    conversations?: ConversationUncheckedUpdateManyWithoutAssignedAgentNestedInput
    messages?: MessageUncheckedUpdateManyWithoutSenderAgentNestedInput
    ownedShortcuts?: ShortcutUncheckedUpdateManyWithoutOwnerNestedInput
    createdShortcuts?: ShortcutUncheckedUpdateManyWithoutCreatedByNestedInput
    shortcutAudits?: ShortcutAuditUncheckedUpdateManyWithoutActorNestedInput
  }

  export type ShortcutAuditUpsertWithWhereUniqueWithoutShortcutInput = {
    where: ShortcutAuditWhereUniqueInput
    update: XOR<ShortcutAuditUpdateWithoutShortcutInput, ShortcutAuditUncheckedUpdateWithoutShortcutInput>
    create: XOR<ShortcutAuditCreateWithoutShortcutInput, ShortcutAuditUncheckedCreateWithoutShortcutInput>
  }

  export type ShortcutAuditUpdateWithWhereUniqueWithoutShortcutInput = {
    where: ShortcutAuditWhereUniqueInput
    data: XOR<ShortcutAuditUpdateWithoutShortcutInput, ShortcutAuditUncheckedUpdateWithoutShortcutInput>
  }

  export type ShortcutAuditUpdateManyWithWhereWithoutShortcutInput = {
    where: ShortcutAuditScalarWhereInput
    data: XOR<ShortcutAuditUpdateManyMutationInput, ShortcutAuditUncheckedUpdateManyWithoutShortcutInput>
  }

  export type ShortcutCreateWithoutAuditsInput = {
    id?: string
    title: string
    message: string
    type: $Enums.ShortcutType
    scope: $Enums.ShortcutScope
    isActive?: boolean
    sortOrder?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    archivedAt?: Date | string | null
    department?: DepartmentCreateNestedOneWithoutShortcutsInput
    owner?: AgentCreateNestedOneWithoutOwnedShortcutsInput
    createdBy: AgentCreateNestedOneWithoutCreatedShortcutsInput
    updatedBy?: AgentCreateNestedOneWithoutUpdatedShortcutsInput
  }

  export type ShortcutUncheckedCreateWithoutAuditsInput = {
    id?: string
    title: string
    message: string
    type: $Enums.ShortcutType
    scope: $Enums.ShortcutScope
    departmentId?: string | null
    ownerId?: string | null
    isActive?: boolean
    sortOrder?: number
    createdById: string
    updatedById?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    archivedAt?: Date | string | null
  }

  export type ShortcutCreateOrConnectWithoutAuditsInput = {
    where: ShortcutWhereUniqueInput
    create: XOR<ShortcutCreateWithoutAuditsInput, ShortcutUncheckedCreateWithoutAuditsInput>
  }

  export type AgentCreateWithoutShortcutAuditsInput = {
    id?: string
    name: string
    email: string
    password?: string
    role?: string
    isActive?: boolean
    isOnline?: boolean
    createdAt?: Date | string
    department?: DepartmentCreateNestedOneWithoutAgentsInput
    conversations?: ConversationCreateNestedManyWithoutAssignedAgentInput
    messages?: MessageCreateNestedManyWithoutSenderAgentInput
    ownedShortcuts?: ShortcutCreateNestedManyWithoutOwnerInput
    createdShortcuts?: ShortcutCreateNestedManyWithoutCreatedByInput
    updatedShortcuts?: ShortcutCreateNestedManyWithoutUpdatedByInput
  }

  export type AgentUncheckedCreateWithoutShortcutAuditsInput = {
    id?: string
    name: string
    email: string
    password?: string
    role?: string
    isActive?: boolean
    departmentId?: string | null
    isOnline?: boolean
    createdAt?: Date | string
    conversations?: ConversationUncheckedCreateNestedManyWithoutAssignedAgentInput
    messages?: MessageUncheckedCreateNestedManyWithoutSenderAgentInput
    ownedShortcuts?: ShortcutUncheckedCreateNestedManyWithoutOwnerInput
    createdShortcuts?: ShortcutUncheckedCreateNestedManyWithoutCreatedByInput
    updatedShortcuts?: ShortcutUncheckedCreateNestedManyWithoutUpdatedByInput
  }

  export type AgentCreateOrConnectWithoutShortcutAuditsInput = {
    where: AgentWhereUniqueInput
    create: XOR<AgentCreateWithoutShortcutAuditsInput, AgentUncheckedCreateWithoutShortcutAuditsInput>
  }

  export type ShortcutUpsertWithoutAuditsInput = {
    update: XOR<ShortcutUpdateWithoutAuditsInput, ShortcutUncheckedUpdateWithoutAuditsInput>
    create: XOR<ShortcutCreateWithoutAuditsInput, ShortcutUncheckedCreateWithoutAuditsInput>
    where?: ShortcutWhereInput
  }

  export type ShortcutUpdateToOneWithWhereWithoutAuditsInput = {
    where?: ShortcutWhereInput
    data: XOR<ShortcutUpdateWithoutAuditsInput, ShortcutUncheckedUpdateWithoutAuditsInput>
  }

  export type ShortcutUpdateWithoutAuditsInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    message?: StringFieldUpdateOperationsInput | string
    type?: EnumShortcutTypeFieldUpdateOperationsInput | $Enums.ShortcutType
    scope?: EnumShortcutScopeFieldUpdateOperationsInput | $Enums.ShortcutScope
    isActive?: BoolFieldUpdateOperationsInput | boolean
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    archivedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    department?: DepartmentUpdateOneWithoutShortcutsNestedInput
    owner?: AgentUpdateOneWithoutOwnedShortcutsNestedInput
    createdBy?: AgentUpdateOneRequiredWithoutCreatedShortcutsNestedInput
    updatedBy?: AgentUpdateOneWithoutUpdatedShortcutsNestedInput
  }

  export type ShortcutUncheckedUpdateWithoutAuditsInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    message?: StringFieldUpdateOperationsInput | string
    type?: EnumShortcutTypeFieldUpdateOperationsInput | $Enums.ShortcutType
    scope?: EnumShortcutScopeFieldUpdateOperationsInput | $Enums.ShortcutScope
    departmentId?: NullableStringFieldUpdateOperationsInput | string | null
    ownerId?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdById?: StringFieldUpdateOperationsInput | string
    updatedById?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    archivedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type AgentUpsertWithoutShortcutAuditsInput = {
    update: XOR<AgentUpdateWithoutShortcutAuditsInput, AgentUncheckedUpdateWithoutShortcutAuditsInput>
    create: XOR<AgentCreateWithoutShortcutAuditsInput, AgentUncheckedCreateWithoutShortcutAuditsInput>
    where?: AgentWhereInput
  }

  export type AgentUpdateToOneWithWhereWithoutShortcutAuditsInput = {
    where?: AgentWhereInput
    data: XOR<AgentUpdateWithoutShortcutAuditsInput, AgentUncheckedUpdateWithoutShortcutAuditsInput>
  }

  export type AgentUpdateWithoutShortcutAuditsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    isOnline?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    department?: DepartmentUpdateOneWithoutAgentsNestedInput
    conversations?: ConversationUpdateManyWithoutAssignedAgentNestedInput
    messages?: MessageUpdateManyWithoutSenderAgentNestedInput
    ownedShortcuts?: ShortcutUpdateManyWithoutOwnerNestedInput
    createdShortcuts?: ShortcutUpdateManyWithoutCreatedByNestedInput
    updatedShortcuts?: ShortcutUpdateManyWithoutUpdatedByNestedInput
  }

  export type AgentUncheckedUpdateWithoutShortcutAuditsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    departmentId?: NullableStringFieldUpdateOperationsInput | string | null
    isOnline?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    conversations?: ConversationUncheckedUpdateManyWithoutAssignedAgentNestedInput
    messages?: MessageUncheckedUpdateManyWithoutSenderAgentNestedInput
    ownedShortcuts?: ShortcutUncheckedUpdateManyWithoutOwnerNestedInput
    createdShortcuts?: ShortcutUncheckedUpdateManyWithoutCreatedByNestedInput
    updatedShortcuts?: ShortcutUncheckedUpdateManyWithoutUpdatedByNestedInput
  }

  export type ProcedureCreateManyDepartmentInput = {
    id?: string
    title: string
    content: string
    order?: number
  }

  export type AgentCreateManyDepartmentInput = {
    id?: string
    name: string
    email: string
    password?: string
    role?: string
    isActive?: boolean
    isOnline?: boolean
    createdAt?: Date | string
  }

  export type ConversationCreateManyDepartmentInput = {
    id?: string
    contactId: string
    status?: string
    assignedAgentId?: string | null
    currentStep?: string | null
    startedAt?: Date | string
    closedAt?: Date | string | null
  }

  export type ShortcutCreateManyDepartmentInput = {
    id?: string
    title: string
    message: string
    type: $Enums.ShortcutType
    scope: $Enums.ShortcutScope
    ownerId?: string | null
    isActive?: boolean
    sortOrder?: number
    createdById: string
    updatedById?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    archivedAt?: Date | string | null
  }

  export type ProcedureUpdateWithoutDepartmentInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    order?: IntFieldUpdateOperationsInput | number
  }

  export type ProcedureUncheckedUpdateWithoutDepartmentInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    order?: IntFieldUpdateOperationsInput | number
  }

  export type ProcedureUncheckedUpdateManyWithoutDepartmentInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    order?: IntFieldUpdateOperationsInput | number
  }

  export type AgentUpdateWithoutDepartmentInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    isOnline?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    conversations?: ConversationUpdateManyWithoutAssignedAgentNestedInput
    messages?: MessageUpdateManyWithoutSenderAgentNestedInput
    ownedShortcuts?: ShortcutUpdateManyWithoutOwnerNestedInput
    createdShortcuts?: ShortcutUpdateManyWithoutCreatedByNestedInput
    updatedShortcuts?: ShortcutUpdateManyWithoutUpdatedByNestedInput
    shortcutAudits?: ShortcutAuditUpdateManyWithoutActorNestedInput
  }

  export type AgentUncheckedUpdateWithoutDepartmentInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    isOnline?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    conversations?: ConversationUncheckedUpdateManyWithoutAssignedAgentNestedInput
    messages?: MessageUncheckedUpdateManyWithoutSenderAgentNestedInput
    ownedShortcuts?: ShortcutUncheckedUpdateManyWithoutOwnerNestedInput
    createdShortcuts?: ShortcutUncheckedUpdateManyWithoutCreatedByNestedInput
    updatedShortcuts?: ShortcutUncheckedUpdateManyWithoutUpdatedByNestedInput
    shortcutAudits?: ShortcutAuditUncheckedUpdateManyWithoutActorNestedInput
  }

  export type AgentUncheckedUpdateManyWithoutDepartmentInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    isOnline?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ConversationUpdateWithoutDepartmentInput = {
    id?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    currentStep?: NullableStringFieldUpdateOperationsInput | string | null
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    closedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    contact?: ContactUpdateOneRequiredWithoutConversationsNestedInput
    assignedAgent?: AgentUpdateOneWithoutConversationsNestedInput
    messages?: MessageUpdateManyWithoutConversationNestedInput
  }

  export type ConversationUncheckedUpdateWithoutDepartmentInput = {
    id?: StringFieldUpdateOperationsInput | string
    contactId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    assignedAgentId?: NullableStringFieldUpdateOperationsInput | string | null
    currentStep?: NullableStringFieldUpdateOperationsInput | string | null
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    closedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    messages?: MessageUncheckedUpdateManyWithoutConversationNestedInput
  }

  export type ConversationUncheckedUpdateManyWithoutDepartmentInput = {
    id?: StringFieldUpdateOperationsInput | string
    contactId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    assignedAgentId?: NullableStringFieldUpdateOperationsInput | string | null
    currentStep?: NullableStringFieldUpdateOperationsInput | string | null
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    closedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type ShortcutUpdateWithoutDepartmentInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    message?: StringFieldUpdateOperationsInput | string
    type?: EnumShortcutTypeFieldUpdateOperationsInput | $Enums.ShortcutType
    scope?: EnumShortcutScopeFieldUpdateOperationsInput | $Enums.ShortcutScope
    isActive?: BoolFieldUpdateOperationsInput | boolean
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    archivedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    owner?: AgentUpdateOneWithoutOwnedShortcutsNestedInput
    createdBy?: AgentUpdateOneRequiredWithoutCreatedShortcutsNestedInput
    updatedBy?: AgentUpdateOneWithoutUpdatedShortcutsNestedInput
    audits?: ShortcutAuditUpdateManyWithoutShortcutNestedInput
  }

  export type ShortcutUncheckedUpdateWithoutDepartmentInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    message?: StringFieldUpdateOperationsInput | string
    type?: EnumShortcutTypeFieldUpdateOperationsInput | $Enums.ShortcutType
    scope?: EnumShortcutScopeFieldUpdateOperationsInput | $Enums.ShortcutScope
    ownerId?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdById?: StringFieldUpdateOperationsInput | string
    updatedById?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    archivedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    audits?: ShortcutAuditUncheckedUpdateManyWithoutShortcutNestedInput
  }

  export type ShortcutUncheckedUpdateManyWithoutDepartmentInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    message?: StringFieldUpdateOperationsInput | string
    type?: EnumShortcutTypeFieldUpdateOperationsInput | $Enums.ShortcutType
    scope?: EnumShortcutScopeFieldUpdateOperationsInput | $Enums.ShortcutScope
    ownerId?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdById?: StringFieldUpdateOperationsInput | string
    updatedById?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    archivedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type ConversationCreateManyAssignedAgentInput = {
    id?: string
    contactId: string
    status?: string
    departmentId?: string | null
    currentStep?: string | null
    startedAt?: Date | string
    closedAt?: Date | string | null
  }

  export type MessageCreateManySenderAgentInput = {
    id?: string
    conversationId: string
    direction: string
    senderType: string
    content: string
    createdAt?: Date | string
    readAt?: Date | string | null
  }

  export type ShortcutCreateManyOwnerInput = {
    id?: string
    title: string
    message: string
    type: $Enums.ShortcutType
    scope: $Enums.ShortcutScope
    departmentId?: string | null
    isActive?: boolean
    sortOrder?: number
    createdById: string
    updatedById?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    archivedAt?: Date | string | null
  }

  export type ShortcutCreateManyCreatedByInput = {
    id?: string
    title: string
    message: string
    type: $Enums.ShortcutType
    scope: $Enums.ShortcutScope
    departmentId?: string | null
    ownerId?: string | null
    isActive?: boolean
    sortOrder?: number
    updatedById?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    archivedAt?: Date | string | null
  }

  export type ShortcutCreateManyUpdatedByInput = {
    id?: string
    title: string
    message: string
    type: $Enums.ShortcutType
    scope: $Enums.ShortcutScope
    departmentId?: string | null
    ownerId?: string | null
    isActive?: boolean
    sortOrder?: number
    createdById: string
    createdAt?: Date | string
    updatedAt?: Date | string
    archivedAt?: Date | string | null
  }

  export type ShortcutAuditCreateManyActorInput = {
    id?: string
    shortcutId?: string | null
    action: string
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
  }

  export type ConversationUpdateWithoutAssignedAgentInput = {
    id?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    currentStep?: NullableStringFieldUpdateOperationsInput | string | null
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    closedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    contact?: ContactUpdateOneRequiredWithoutConversationsNestedInput
    department?: DepartmentUpdateOneWithoutConversationsNestedInput
    messages?: MessageUpdateManyWithoutConversationNestedInput
  }

  export type ConversationUncheckedUpdateWithoutAssignedAgentInput = {
    id?: StringFieldUpdateOperationsInput | string
    contactId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    departmentId?: NullableStringFieldUpdateOperationsInput | string | null
    currentStep?: NullableStringFieldUpdateOperationsInput | string | null
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    closedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    messages?: MessageUncheckedUpdateManyWithoutConversationNestedInput
  }

  export type ConversationUncheckedUpdateManyWithoutAssignedAgentInput = {
    id?: StringFieldUpdateOperationsInput | string
    contactId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    departmentId?: NullableStringFieldUpdateOperationsInput | string | null
    currentStep?: NullableStringFieldUpdateOperationsInput | string | null
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    closedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type MessageUpdateWithoutSenderAgentInput = {
    id?: StringFieldUpdateOperationsInput | string
    direction?: StringFieldUpdateOperationsInput | string
    senderType?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    readAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    conversation?: ConversationUpdateOneRequiredWithoutMessagesNestedInput
  }

  export type MessageUncheckedUpdateWithoutSenderAgentInput = {
    id?: StringFieldUpdateOperationsInput | string
    conversationId?: StringFieldUpdateOperationsInput | string
    direction?: StringFieldUpdateOperationsInput | string
    senderType?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    readAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type MessageUncheckedUpdateManyWithoutSenderAgentInput = {
    id?: StringFieldUpdateOperationsInput | string
    conversationId?: StringFieldUpdateOperationsInput | string
    direction?: StringFieldUpdateOperationsInput | string
    senderType?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    readAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type ShortcutUpdateWithoutOwnerInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    message?: StringFieldUpdateOperationsInput | string
    type?: EnumShortcutTypeFieldUpdateOperationsInput | $Enums.ShortcutType
    scope?: EnumShortcutScopeFieldUpdateOperationsInput | $Enums.ShortcutScope
    isActive?: BoolFieldUpdateOperationsInput | boolean
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    archivedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    department?: DepartmentUpdateOneWithoutShortcutsNestedInput
    createdBy?: AgentUpdateOneRequiredWithoutCreatedShortcutsNestedInput
    updatedBy?: AgentUpdateOneWithoutUpdatedShortcutsNestedInput
    audits?: ShortcutAuditUpdateManyWithoutShortcutNestedInput
  }

  export type ShortcutUncheckedUpdateWithoutOwnerInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    message?: StringFieldUpdateOperationsInput | string
    type?: EnumShortcutTypeFieldUpdateOperationsInput | $Enums.ShortcutType
    scope?: EnumShortcutScopeFieldUpdateOperationsInput | $Enums.ShortcutScope
    departmentId?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdById?: StringFieldUpdateOperationsInput | string
    updatedById?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    archivedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    audits?: ShortcutAuditUncheckedUpdateManyWithoutShortcutNestedInput
  }

  export type ShortcutUncheckedUpdateManyWithoutOwnerInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    message?: StringFieldUpdateOperationsInput | string
    type?: EnumShortcutTypeFieldUpdateOperationsInput | $Enums.ShortcutType
    scope?: EnumShortcutScopeFieldUpdateOperationsInput | $Enums.ShortcutScope
    departmentId?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdById?: StringFieldUpdateOperationsInput | string
    updatedById?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    archivedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type ShortcutUpdateWithoutCreatedByInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    message?: StringFieldUpdateOperationsInput | string
    type?: EnumShortcutTypeFieldUpdateOperationsInput | $Enums.ShortcutType
    scope?: EnumShortcutScopeFieldUpdateOperationsInput | $Enums.ShortcutScope
    isActive?: BoolFieldUpdateOperationsInput | boolean
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    archivedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    department?: DepartmentUpdateOneWithoutShortcutsNestedInput
    owner?: AgentUpdateOneWithoutOwnedShortcutsNestedInput
    updatedBy?: AgentUpdateOneWithoutUpdatedShortcutsNestedInput
    audits?: ShortcutAuditUpdateManyWithoutShortcutNestedInput
  }

  export type ShortcutUncheckedUpdateWithoutCreatedByInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    message?: StringFieldUpdateOperationsInput | string
    type?: EnumShortcutTypeFieldUpdateOperationsInput | $Enums.ShortcutType
    scope?: EnumShortcutScopeFieldUpdateOperationsInput | $Enums.ShortcutScope
    departmentId?: NullableStringFieldUpdateOperationsInput | string | null
    ownerId?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    sortOrder?: IntFieldUpdateOperationsInput | number
    updatedById?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    archivedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    audits?: ShortcutAuditUncheckedUpdateManyWithoutShortcutNestedInput
  }

  export type ShortcutUncheckedUpdateManyWithoutCreatedByInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    message?: StringFieldUpdateOperationsInput | string
    type?: EnumShortcutTypeFieldUpdateOperationsInput | $Enums.ShortcutType
    scope?: EnumShortcutScopeFieldUpdateOperationsInput | $Enums.ShortcutScope
    departmentId?: NullableStringFieldUpdateOperationsInput | string | null
    ownerId?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    sortOrder?: IntFieldUpdateOperationsInput | number
    updatedById?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    archivedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type ShortcutUpdateWithoutUpdatedByInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    message?: StringFieldUpdateOperationsInput | string
    type?: EnumShortcutTypeFieldUpdateOperationsInput | $Enums.ShortcutType
    scope?: EnumShortcutScopeFieldUpdateOperationsInput | $Enums.ShortcutScope
    isActive?: BoolFieldUpdateOperationsInput | boolean
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    archivedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    department?: DepartmentUpdateOneWithoutShortcutsNestedInput
    owner?: AgentUpdateOneWithoutOwnedShortcutsNestedInput
    createdBy?: AgentUpdateOneRequiredWithoutCreatedShortcutsNestedInput
    audits?: ShortcutAuditUpdateManyWithoutShortcutNestedInput
  }

  export type ShortcutUncheckedUpdateWithoutUpdatedByInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    message?: StringFieldUpdateOperationsInput | string
    type?: EnumShortcutTypeFieldUpdateOperationsInput | $Enums.ShortcutType
    scope?: EnumShortcutScopeFieldUpdateOperationsInput | $Enums.ShortcutScope
    departmentId?: NullableStringFieldUpdateOperationsInput | string | null
    ownerId?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdById?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    archivedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    audits?: ShortcutAuditUncheckedUpdateManyWithoutShortcutNestedInput
  }

  export type ShortcutUncheckedUpdateManyWithoutUpdatedByInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    message?: StringFieldUpdateOperationsInput | string
    type?: EnumShortcutTypeFieldUpdateOperationsInput | $Enums.ShortcutType
    scope?: EnumShortcutScopeFieldUpdateOperationsInput | $Enums.ShortcutScope
    departmentId?: NullableStringFieldUpdateOperationsInput | string | null
    ownerId?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdById?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    archivedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type ShortcutAuditUpdateWithoutActorInput = {
    id?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    shortcut?: ShortcutUpdateOneWithoutAuditsNestedInput
  }

  export type ShortcutAuditUncheckedUpdateWithoutActorInput = {
    id?: StringFieldUpdateOperationsInput | string
    shortcutId?: NullableStringFieldUpdateOperationsInput | string | null
    action?: StringFieldUpdateOperationsInput | string
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ShortcutAuditUncheckedUpdateManyWithoutActorInput = {
    id?: StringFieldUpdateOperationsInput | string
    shortcutId?: NullableStringFieldUpdateOperationsInput | string | null
    action?: StringFieldUpdateOperationsInput | string
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ConversationCreateManyContactInput = {
    id?: string
    status?: string
    departmentId?: string | null
    assignedAgentId?: string | null
    currentStep?: string | null
    startedAt?: Date | string
    closedAt?: Date | string | null
  }

  export type ConversationUpdateWithoutContactInput = {
    id?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    currentStep?: NullableStringFieldUpdateOperationsInput | string | null
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    closedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    department?: DepartmentUpdateOneWithoutConversationsNestedInput
    assignedAgent?: AgentUpdateOneWithoutConversationsNestedInput
    messages?: MessageUpdateManyWithoutConversationNestedInput
  }

  export type ConversationUncheckedUpdateWithoutContactInput = {
    id?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    departmentId?: NullableStringFieldUpdateOperationsInput | string | null
    assignedAgentId?: NullableStringFieldUpdateOperationsInput | string | null
    currentStep?: NullableStringFieldUpdateOperationsInput | string | null
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    closedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    messages?: MessageUncheckedUpdateManyWithoutConversationNestedInput
  }

  export type ConversationUncheckedUpdateManyWithoutContactInput = {
    id?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    departmentId?: NullableStringFieldUpdateOperationsInput | string | null
    assignedAgentId?: NullableStringFieldUpdateOperationsInput | string | null
    currentStep?: NullableStringFieldUpdateOperationsInput | string | null
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    closedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type MessageCreateManyConversationInput = {
    id?: string
    direction: string
    senderType: string
    senderAgentId?: string | null
    content: string
    createdAt?: Date | string
    readAt?: Date | string | null
  }

  export type MessageUpdateWithoutConversationInput = {
    id?: StringFieldUpdateOperationsInput | string
    direction?: StringFieldUpdateOperationsInput | string
    senderType?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    readAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    senderAgent?: AgentUpdateOneWithoutMessagesNestedInput
  }

  export type MessageUncheckedUpdateWithoutConversationInput = {
    id?: StringFieldUpdateOperationsInput | string
    direction?: StringFieldUpdateOperationsInput | string
    senderType?: StringFieldUpdateOperationsInput | string
    senderAgentId?: NullableStringFieldUpdateOperationsInput | string | null
    content?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    readAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type MessageUncheckedUpdateManyWithoutConversationInput = {
    id?: StringFieldUpdateOperationsInput | string
    direction?: StringFieldUpdateOperationsInput | string
    senderType?: StringFieldUpdateOperationsInput | string
    senderAgentId?: NullableStringFieldUpdateOperationsInput | string | null
    content?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    readAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type ShortcutAuditCreateManyShortcutInput = {
    id?: string
    actorId: string
    action: string
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
  }

  export type ShortcutAuditUpdateWithoutShortcutInput = {
    id?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    actor?: AgentUpdateOneRequiredWithoutShortcutAuditsNestedInput
  }

  export type ShortcutAuditUncheckedUpdateWithoutShortcutInput = {
    id?: StringFieldUpdateOperationsInput | string
    actorId?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ShortcutAuditUncheckedUpdateManyWithoutShortcutInput = {
    id?: StringFieldUpdateOperationsInput | string
    actorId?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Aliases for legacy arg types
   */
    /**
     * @deprecated Use DepartmentCountOutputTypeDefaultArgs instead
     */
    export type DepartmentCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = DepartmentCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use AgentCountOutputTypeDefaultArgs instead
     */
    export type AgentCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = AgentCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ContactCountOutputTypeDefaultArgs instead
     */
    export type ContactCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ContactCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ConversationCountOutputTypeDefaultArgs instead
     */
    export type ConversationCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ConversationCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ShortcutCountOutputTypeDefaultArgs instead
     */
    export type ShortcutCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ShortcutCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use DepartmentDefaultArgs instead
     */
    export type DepartmentArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = DepartmentDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ProcedureDefaultArgs instead
     */
    export type ProcedureArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ProcedureDefaultArgs<ExtArgs>
    /**
     * @deprecated Use AgentDefaultArgs instead
     */
    export type AgentArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = AgentDefaultArgs<ExtArgs>
    /**
     * @deprecated Use RolePermissionDefaultArgs instead
     */
    export type RolePermissionArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = RolePermissionDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ContactDefaultArgs instead
     */
    export type ContactArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ContactDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ConversationDefaultArgs instead
     */
    export type ConversationArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ConversationDefaultArgs<ExtArgs>
    /**
     * @deprecated Use MessageDefaultArgs instead
     */
    export type MessageArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = MessageDefaultArgs<ExtArgs>
    /**
     * @deprecated Use FlowDefinitionDefaultArgs instead
     */
    export type FlowDefinitionArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = FlowDefinitionDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ZApiConfigDefaultArgs instead
     */
    export type ZApiConfigArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ZApiConfigDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ShortcutDefaultArgs instead
     */
    export type ShortcutArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ShortcutDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ShortcutAuditDefaultArgs instead
     */
    export type ShortcutAuditArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ShortcutAuditDefaultArgs<ExtArgs>

  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}