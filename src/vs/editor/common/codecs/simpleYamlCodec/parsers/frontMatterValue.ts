/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { PartialFrontMatterArray } from './frontMatterArray.js';
import { PartialFrontMatterString } from './frontMatterString.js';
import { PartialFrontMatterBoolean } from './frontMatterBoolean.js';
import { FrontMatterValueToken } from '../tokens/frontMatterToken.js';
import { TSimpleDecoderToken } from '../../simpleCodec/simpleDecoder.js';
import { Word, Space, Quote, DoubleQuote, LeftBracket } from '../../simpleCodec/tokens/index.js';
import { assertNotConsumed, ParserBase, TAcceptTokenResult } from '../../simpleCodec/parserBase.js';

/**
 * TODO: @legomushroom
 */
export class PartialFrontMatterValue extends ParserBase<TSimpleDecoderToken, PartialFrontMatterValue | FrontMatterValueToken> {
	/**
	 * TODO: @legomushroom
	 */
	private currentValueParser?: PartialFrontMatterString | PartialFrontMatterBoolean | PartialFrontMatterArray;

	@assertNotConsumed
	public accept(token: TSimpleDecoderToken): TAcceptTokenResult<PartialFrontMatterValue | FrontMatterValueToken> {
		if (this.currentValueParser !== undefined) {
			const acceptResult = this.currentValueParser.accept(token);
			const { result, wasTokenConsumed } = acceptResult;

			if (result === 'success') {
				const { nextParser } = acceptResult;

				if (nextParser instanceof FrontMatterValueToken) {
					return {
						result: 'success',
						nextParser,
						wasTokenConsumed,
					};
				}

				this.currentValueParser = nextParser;
				return {
					result: 'success',
					nextParser: this,
					wasTokenConsumed,
				};
			}

			// TODO: @legomushroom - implement `tokens` getter so consumer can re-emit tokens of the current value parser
			return {
				result: 'failure',
				wasTokenConsumed,
			};
		}


		// iterate until first non-space character
		if (token instanceof Space) {
			return {
				result: 'success',
				nextParser: this,
				wasTokenConsumed: true,
			};
		}

		// if the first token represents a `quote` character, try to parse a string value
		if ((token instanceof Quote) || (token instanceof DoubleQuote)) {
			this.currentValueParser = new PartialFrontMatterString(token);

			return {
				result: 'success',
				nextParser: this,
				wasTokenConsumed: true,
			};
		}

		// if the first token represents a `[` character, try to parse an array value
		if (token instanceof LeftBracket) {
			this.currentValueParser = new PartialFrontMatterArray(token);

			return {
				result: 'success',
				nextParser: this,
				wasTokenConsumed: true,
			};
		}

		// if the first token represents a `word` try to parse a boolean
		if (token instanceof Word) {
			try {
				this.currentValueParser = new PartialFrontMatterBoolean(token);

				return {
					result: 'success',
					nextParser: this,
					wasTokenConsumed: true,
				};
			} catch (_error) {
				return {
					result: 'failure',
					wasTokenConsumed: false,
				};
			}


		}

		// in all other cases fail due to unexpected value sequence
		return {
			result: 'failure',
			wasTokenConsumed: false,
		};
	}
}
