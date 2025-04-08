/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { LeftBracket } from '../../simpleCodec/tokens/index.js';
import { FrontMatterArray } from '../tokens/frontMatterArray.js';
import { TSimpleDecoderToken } from '../../simpleCodec/simpleDecoder.js';
import { assertNotConsumed, ParserBase, TAcceptTokenResult } from '../../simpleCodec/parserBase.js';

/**
 * TODO: @legomushroom
 */
export class PartialFrontMatterArray extends ParserBase<TSimpleDecoderToken, PartialFrontMatterArray | FrontMatterArray> {
	constructor(
		private readonly startToken: LeftBracket,
	) {
		super([startToken]);
	}

	@assertNotConsumed
	public accept(token: TSimpleDecoderToken): TAcceptTokenResult<PartialFrontMatterArray | FrontMatterArray> {
	}
}
