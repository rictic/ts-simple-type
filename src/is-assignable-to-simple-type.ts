import { combineIntersectingSimpleTypes } from "./combine-intersecting-simple-types";
import { isSimpleTypeLiteral, PRIMITIVE_TYPE_TO_LITERAL_MAP, SimpleType, SimpleTypeGenericArguments, SimpleTypeKind } from "./simple-type";
import { SimpleTypeComparisonOptions } from "./simple-type-comparison-options";
import { getTupleLengthType } from "./simple-type-util";
import { and, or } from "./util";

const DEFAULT_CONFIG: SimpleTypeComparisonOptions = {
	strict: true
};

/**
 * Returns if typeB is assignable to typeA.
 * @param typeA Type A
 * @param typeB Type B
 * @param config
 */
export function isAssignableToSimpleType(typeA: SimpleType, typeB: SimpleType, config: SimpleTypeComparisonOptions = DEFAULT_CONFIG): boolean {
	return isAssignableToSimpleTypeInternal(typeA, typeB, {
		config,
		inCircularA: false,
		inCircularB: false,
		insideType: new Set(),
		genericParameterMapA: new Map(),
		genericParameterMapB: new Map()
	});
}

interface IsAssignableToSimpleTypeOptions {
	config: SimpleTypeComparisonOptions;
	inCircularA: boolean;
	inCircularB: boolean;
	insideType: Set<SimpleType>;
	genericParameterMapA: Map<string, SimpleType>;
	genericParameterMapB: Map<string, SimpleType>;
}

function isAssignableToSimpleTypeInternal(typeA: SimpleType, typeB: SimpleType, options: IsAssignableToSimpleTypeOptions): boolean {
	/**/
	options = { ...options };
	(options as any).depth = ((options as any).depth || 0) + 1;
	//console.log("###", "\t".repeat((options as any).depth), simpleTypeToString(typeA), "===", simpleTypeToString(typeB), "(", typeA.kind, "===", typeB.kind, ")", (options as any).depth, "###");
	//if ((options as any).depth > 10) return false;
	console.log(
		"###",
		"\t".repeat((options as any).depth),
		require("./simple-type-to-string").simpleTypeToString(typeA),
		"===",
		require("./simple-type-to-string").simpleTypeToString(typeB),
		"(",
		typeA.kind,
		"===",
		typeB.kind,
		")",
		(options as any).depth,
		"###"
	);
	/**/

	if (typeA === typeB) {
		return true;
	}

	// We might need a better way of handling refs, but these check are good for now
	if (options.insideType.has(typeA) || options.insideType.has(typeB)) {
		return true;
	}

	// Circular types
	if (options.inCircularA || options.inCircularB) {
		return true;
	}

	// Any and unknown
	if (typeA.kind === SimpleTypeKind.UNKNOWN || typeA.kind === SimpleTypeKind.ANY) {
		return true;
	}

	// This check has been added to optimize complex types.
	// It's only run on named non-generic interface, object, alias and class types
	// Here we compare their names to see if they are equal. For example comparing "HTMLElement === HTMLElement" don't need to traverse both structures.
	// I will remove this check after I add optimization and caching of comparison results (especially for built in types)
	// The basic challenge is that types that I compare do not necessarily share references, so a reference check isn't enough
	if (
		typeA.kind === typeB.kind &&
		[SimpleTypeKind.INTERFACE, SimpleTypeKind.OBJECT, SimpleTypeKind.ALIAS, SimpleTypeKind.CLASS].includes(typeA.kind) &&
		!("typeParameters" in typeA) &&
		!("typeParameters" in typeB) &&
		(typeA.name && typeB.name && typeA.name === typeB.name)
	) {
		return true;
	}

	switch (typeB.kind) {
		case SimpleTypeKind.ANY:
			// "any" can be assigned to anything but "never"
			return typeA.kind !== SimpleTypeKind.NEVER;

		case SimpleTypeKind.NEVER:
			// "never" can be assigned to anything
			return true;

		case SimpleTypeKind.CIRCULAR_TYPE_REF:
			return isAssignableToSimpleTypeInternal(typeA, typeB.ref, {
				...options,
				inCircularB: true,
				insideType: new Set([...options.insideType, typeB])
			});
		case SimpleTypeKind.ENUM_MEMBER:
			return isAssignableToSimpleTypeInternal(typeA, typeB.type, options);
		case SimpleTypeKind.ENUM:
			return and(typeB.types, childTypeB => isAssignableToSimpleTypeInternal(typeA, childTypeB, options));
		case SimpleTypeKind.UNION:
			return and(typeB.types, childTypeB => isAssignableToSimpleTypeInternal(typeA, childTypeB, options));
		case SimpleTypeKind.INTERSECTION: {
			const combinedIntersectionType = combineIntersectingSimpleTypes(typeB.types);

			console.log(`combined`);
			console.dir(combinedIntersectionType, { depth: null });

			if (combinedIntersectionType.kind === SimpleTypeKind.INTERSECTION) {
				return or(combinedIntersectionType.types, memberB => isAssignableToSimpleTypeInternal(typeA, memberB, options));
			}
			return isAssignableToSimpleTypeInternal(typeA, combinedIntersectionType, options);
		}

		case SimpleTypeKind.ALIAS:
			return isAssignableToSimpleTypeInternal(typeA, typeB.target, options);
		case SimpleTypeKind.GENERIC_ARGUMENTS: {
			return isAssignableToSimpleTypeInternal(typeA, typeB.target, {
				...options,
				genericParameterMapB: extendTypeParameterMap(typeB, options.genericParameterMapB)
			});
		}
		case SimpleTypeKind.GENERIC_PARAMETER: {
			const newOptions = {
				...options,
				insideType: new Set([...options.insideType, typeB])
			};

			const realType = options.genericParameterMapB.get(typeB.name);
			return isAssignableToSimpleTypeInternal(typeA, realType || typeB.default || { kind: SimpleTypeKind.ANY }, newOptions);
		}

		case SimpleTypeKind.UNDEFINED:
		case SimpleTypeKind.NULL: {
			// When strict null checks are turned off, "undefined" and "null" are in the domain of every type
			const strictNullChecks = options.config.strictNullChecks === true || (options.config.strictNullChecks == null && options.config.strict);
			if (!strictNullChecks) {
				return true;
			}
			break;
		}
	}

	switch (typeA.kind) {
		// Circular references
		case SimpleTypeKind.CIRCULAR_TYPE_REF:
			return isAssignableToSimpleTypeInternal(typeA.ref, typeB, {
				...options,
				inCircularA: true,
				insideType: new Set([...options.insideType, typeA])
			});

		// Literals and enum members
		case SimpleTypeKind.NUMBER_LITERAL:
		case SimpleTypeKind.STRING_LITERAL:
		case SimpleTypeKind.BIG_INT_LITERAL:
		case SimpleTypeKind.BOOLEAN_LITERAL:
			return isSimpleTypeLiteral(typeB) ? typeA.value === typeB.value : false;

		case SimpleTypeKind.ENUM_MEMBER:
			// There exists an interesting rule that you can always assign a "number" or any "number literal" to a "number literal"
			//   when the "number literal" is from an enum member type.
			if (typeA.type.kind === SimpleTypeKind.NUMBER_LITERAL && [SimpleTypeKind.NUMBER, SimpleTypeKind.NUMBER_LITERAL].includes(typeB.kind)) {
				return true;
			}

			return isAssignableToSimpleTypeInternal(typeA.type, typeB, options);

		// Primitive types
		case SimpleTypeKind.STRING:
		case SimpleTypeKind.BOOLEAN:
		case SimpleTypeKind.NUMBER:
		case SimpleTypeKind.BIG_INT: {
			if (isSimpleTypeLiteral(typeB)) {
				return PRIMITIVE_TYPE_TO_LITERAL_MAP[typeA.kind] === typeB.kind;
			}

			return typeA.kind === typeB.kind;
		}

		case SimpleTypeKind.UNDEFINED:
		case SimpleTypeKind.NULL:
			return typeA.kind === typeB.kind;

		// Void
		case SimpleTypeKind.VOID:
			return typeB.kind === SimpleTypeKind.VOID || typeB.kind === SimpleTypeKind.UNDEFINED;

		// Never
		case SimpleTypeKind.NEVER:
			return false;

		// Alias
		case SimpleTypeKind.ALIAS:
			return isAssignableToSimpleTypeInternal(typeA.target, typeB, options);

		// Generic types
		case SimpleTypeKind.GENERIC_PARAMETER: {
			const newOptions = {
				...options,
				insideType: new Set([...options.insideType, typeA])
			};

			const realType = options.genericParameterMapA.get(typeA.name);
			return isAssignableToSimpleTypeInternal(realType || typeA.default || { kind: SimpleTypeKind.ANY }, typeB, newOptions);
		}

		case SimpleTypeKind.GENERIC_ARGUMENTS:
			return isAssignableToSimpleTypeInternal(typeA.target, typeB, {
				...options,
				genericParameterMapA: extendTypeParameterMap(typeA, options.genericParameterMapA)
			});

		// Arrays
		case SimpleTypeKind.ARRAY: {
			if (typeB.kind === SimpleTypeKind.ARRAY) {
				return isAssignableToSimpleTypeInternal(typeA.type, typeB.type, options);
			} else if (typeB.kind === SimpleTypeKind.TUPLE) {
				return and(typeB.members, memberB => isAssignableToSimpleTypeInternal(typeA.type, memberB.type, options));
			}

			return false;
		}

		// Functions
		case SimpleTypeKind.FUNCTION:
		case SimpleTypeKind.METHOD: {
			if (typeB.kind !== SimpleTypeKind.FUNCTION && typeB.kind !== SimpleTypeKind.METHOD) return false;

			if (typeB.argTypes == null || typeB.returnType == null) return typeA.argTypes == null || typeA.returnType == null;
			if (typeA.argTypes == null || typeA.returnType == null) return true;

			// Any returntype is assignable to void
			if (typeA.returnType.kind !== SimpleTypeKind.VOID && !isAssignableToSimpleTypeInternal(typeA.returnType, typeB.returnType, options)) return false;

			// Test "this" types
			const typeAThisArg = typeA.argTypes.find(arg => arg.name === "this");
			const typeBThisArg = typeB.argTypes.find(arg => arg.name === "this");

			if (typeAThisArg != null && typeBThisArg != null) {
				if (!isAssignableToSimpleTypeInternal(typeAThisArg.type, typeBThisArg.type, options)) {
					return false;
				}
			}

			const argTypesA = typeAThisArg == null ? typeA.argTypes : typeA.argTypes.filter(arg => arg !== typeAThisArg);
			const argTypesB = typeBThisArg == null ? typeB.argTypes : typeB.argTypes.filter(arg => arg !== typeBThisArg);

			// A function with 0 args can be assigned to any other function
			if (argTypesB.length === 0) {
				return true;
			}

			// Compare the types of each arg
			for (let i = 0; i < Math.max(argTypesA.length, argTypesB.length); i++) {
				const argA = argTypesA[i];
				const argB = argTypesB[i];

				// If argA is not present, check if argB is optional or not present as well
				if (argA == null) {
					return argB == null || argB.optional;
				}

				// If argB is not present, check if argA is optional
				if (argB == null) {
					return argA.optional;
				}

				// Check if we are comparing a spread against a non-spread
				if (argA.spread && argA.type.kind === SimpleTypeKind.ARRAY && (!argB.spread && argB.type.kind !== SimpleTypeKind.ARRAY)) {
					if (!isAssignableToSimpleTypeInternal(argA.type.type, argB.type, options)) {
						return false;
					}

					continue;
				}

				// If the types are not assignable return false right away
				if (!isAssignableToSimpleTypeInternal(argB.type, argA.type, options)) {
					return false;
				}
			}

			return true;
		}

		// Unions and enum members
		case SimpleTypeKind.ENUM:
		case SimpleTypeKind.UNION:
			return or(typeA.types, childTypeA => isAssignableToSimpleTypeInternal(childTypeA, typeB, options));

		// Intersections
		case SimpleTypeKind.INTERSECTION: {
			const combinedIntersectionType = combineIntersectingSimpleTypes(typeA.types);
			console.log(`combined`);
			console.dir(combinedIntersectionType, { depth: null });

			if (combinedIntersectionType.kind === SimpleTypeKind.INTERSECTION) {
				return and(combinedIntersectionType.types, memberA => isAssignableToSimpleTypeInternal(memberA, typeB, options));
			}

			return isAssignableToSimpleTypeInternal(combinedIntersectionType, typeB, options);
		}

		// Interfaces
		case SimpleTypeKind.INTERFACE:
		case SimpleTypeKind.OBJECT:
		case SimpleTypeKind.CLASS: {
			// If there are no members check that "typeB" is not assignable to 'null' and 'undefined'.
			// Here we allow assigning anything but 'null' and 'undefined' to the type '{}'
			if ("members" in typeA && (typeA.members == null || typeA.members.length === 0)) {
				return !isAssignableToSimpleTypeInternal(
					{
						kind: SimpleTypeKind.UNION,
						types: [{ kind: SimpleTypeKind.NULL }, { kind: SimpleTypeKind.UNDEFINED }]
					},
					typeB,
					options
				);
			}

			switch (typeB.kind) {
				case SimpleTypeKind.INTERFACE:
				case SimpleTypeKind.OBJECT:
				case SimpleTypeKind.CLASS: {
					const membersA = typeA.kind === SimpleTypeKind.CLASS ? [...typeA.methods, ...typeA.properties] : typeA.members || [];
					const membersB = typeB.kind === SimpleTypeKind.CLASS ? [...typeB.methods, ...typeB.properties] : typeB.members || [];

					const newOptions = {
						...options,
						insideType: new Set([...options.insideType, typeA, typeB])
					};

					return (
						and(membersA, memberA => {
							// Make sure that every required prop in typeA is present
							const memberB = membersB.find(memberB => memberA.name === memberB.name);
							return memberB == null ? memberA.optional : true;
						}) &&
						and(membersB, memberB => {
							// Do not allow new props in subtype: contravariance
							const memberA = membersA.find(memberA => memberA.name === memberB.name);
							if (memberA == null) {
								// If we find a member in typeB which isn't in typeA, allow it if both typeA and typeB are object
								//return typeA.kind === SimpleTypeKind.OBJECT && typeB.kind === SimpleTypeKind.OBJECT;
								return typeA.kind === typeB.kind;
							}
							return isAssignableToSimpleTypeInternal(memberA.type, memberB.type, newOptions);
						})
					);
				}
				default:
					return false;
			}
		}

		case SimpleTypeKind.TUPLE: {
			if (typeB.kind !== SimpleTypeKind.TUPLE) return false;

			console.log(getTupleLengthType(typeA), getTupleLengthType(typeB));
			if (!isAssignableToSimpleTypeInternal(getTupleLengthType(typeA), getTupleLengthType(typeB), options)) {
				console.log(`- not assignable`);
				return false;
			}
			console.log(`- assignable`);

			return and(typeA.members, (memberA, i) => {
				const memberB = typeB.members[i];
				if (memberB == null) return memberA.optional;
				return isAssignableToSimpleTypeInternal(memberA.type, memberB.type, options);
			});
		}

		case SimpleTypeKind.PROMISE:
			return typeB.kind === SimpleTypeKind.PROMISE && isAssignableToSimpleTypeInternal(typeA.type, typeB.type, options);

		case SimpleTypeKind.DATE:
			return typeB.kind === SimpleTypeKind.DATE;

		//default:
		//throw new Error(`Unsupported comparison: ${typeA.kind}`);
	}
}

function extendTypeParameterMap(genericType: SimpleTypeGenericArguments, existingMap: Map<string, SimpleType>) {
	if ("typeParameters" in genericType.target) {
		const parameterEntries = (genericType.target.typeParameters || []).map(
			(parameter, i) => [parameter.name, genericType.typeArguments[i] || parameter.default || { kind: SimpleTypeKind.ANY }] as [string, SimpleType]
		);
		const allParameterEntries = [...existingMap.entries(), ...parameterEntries];
		return new Map(allParameterEntries);
	}

	throw new Error(`Couldn't find 'typeParameter' for type '${genericType.target.kind}'`);
	//return existingMap;
}
