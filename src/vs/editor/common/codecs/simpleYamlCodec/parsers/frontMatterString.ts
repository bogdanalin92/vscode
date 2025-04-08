/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { FrontMatterString } from '../tokens/frontMatterString.js';
import { TSimpleDecoderToken } from '../../simpleCodec/simpleDecoder.js';
import { CarriageReturn } from '../../linesCodec/tokens/carriageReturn.js';
import { Quote, DoubleQuote, SimpleToken, Space, Tab } from '../../simpleCodec/tokens/index.js';
import { assertNotConsumed, ParserBase, TAcceptTokenResult } from '../../simpleCodec/parserBase.js';
import { NewLine } from '../../linesCodec/tokens/newLine.js';
import { assertDefined } from '../../../../../base/common/types.js';

/**
 * TODO: @legomushroom
 */
// TODO: @legomushroom - any other tokens allowed?
const ALLOWED_TOKENS = [
	Space, Tab, CarriageReturn,
];

/**
 * TODO: @legomushroom
 */
type TQuoteToken = Quote | DoubleQuote;

/**
 * TODO: @legomushroom
 */
export class PartialFrontMatterString extends ParserBase<TSimpleDecoderToken, PartialFrontMatterString | FrontMatterString<TQuoteToken>> {
	constructor(
		private readonly startToken: TQuoteToken,
	) {
		super([startToken]);
	}

	/**
	 * TODO: @legomushroom
	 */
	private endToken: TQuoteToken | undefined;

	@assertNotConsumed
	public accept(token: TSimpleDecoderToken): TAcceptTokenResult<PartialFrontMatterString | FrontMatterString<TQuoteToken>> {
		if (this.endToken !== undefined) {
			for (const AllowedToken of ALLOWED_TOKENS) {
				if (token instanceof AllowedToken) {
					this.currentTokens.push(token);

					return {
						result: 'success',
						nextParser: this,
						wasTokenConsumed: true,
					};
				}
			}

			// new line terminates the parsing process
			if (token instanceof NewLine) {
				this.currentTokens.push(token);

				this.isConsumed = true;
				return {
					result: 'success',
					nextParser: this.asStringToken(),
					wasTokenConsumed: true,
				};
			}
		}

		// iterate until a `matching end quote` is found
		if ((token instanceof SimpleToken) && (this.startToken.sameType(token))) {
			// this.isConsumed = true;

			this.endToken = token;

			return {
				result: 'success',
				nextParser: this,
				// nextParser: new FrontMatterString([
				// 	this.startToken,
				// 	...this.currentTokens.slice(1),
				// 	token,
				// ]),
				wasTokenConsumed: true,
			};
		}

		this.currentTokens.push(token);
		return {
			result: 'success',
			nextParser: this,
			wasTokenConsumed: true,
		};
	}

	/**
	 * TODO: @legomushroom
	 */
	public asStringToken(): FrontMatterString<TQuoteToken> {
		assertDefined(
			this.endToken,
			`No matching end quote found.`,
		);

		// const value = asBoolean(this.startToken);
		// assertDefined(
		// 	value,
		// 	`Expected a word that can be converted to a boolean, got '${this.startToken}'.`,
		// );

		// return new FrontMatterBoolean(
		// 	this.startToken.range,
		// 	value,
		// );
	}
}
