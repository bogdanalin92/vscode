/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { NewLine } from '../linesCodec/tokens/newLine.js';
import { VSBuffer } from '../../../../base/common/buffer.js';
import { FrontMatterToken } from './tokens/frontMatterToken.js';
import { Space, Tab, Word } from '../simpleCodec/tokens/index.js';
import { ReadableStream } from '../../../../base/common/stream.js';
import { CarriageReturn } from '../linesCodec/tokens/carriageReturn.js';
import { BaseDecoder } from '../../../../base/common/codecs/baseDecoder.js';
import { SimpleDecoder, TSimpleDecoderToken } from '../simpleCodec/simpleDecoder.js';
import { FrontMatterRecord, PartialFrontMatterRecord, PartialFrontMatterRecordName, PartialFrontMatterRecordNameWithDelimiter } from './parsers/frontMatterRecord.js';

/**
 * Tokens produced by this decoder.
 */
export type TFrontMatterToken = FrontMatterRecord | TSimpleDecoderToken;

/**
 * TODO: @legomushroom
 */
export class FrontMatterDecoder extends BaseDecoder<TFrontMatterToken, TSimpleDecoderToken> {
	/**
	 * TODO: @legomushroom
	 */
	private current?: PartialFrontMatterRecordName | PartialFrontMatterRecordNameWithDelimiter | PartialFrontMatterRecord;

	constructor(
		stream: ReadableStream<VSBuffer>,
	) {
		super(new SimpleDecoder(stream));
	}

	protected override onStreamData(token: TSimpleDecoderToken): void {
		if (this.current !== undefined) {
			const acceptResult = this.current.accept(token);
			const { result, wasTokenConsumed } = acceptResult;

			if (result === 'failure') {
				this.reEmitCurrentTokens();

				if (wasTokenConsumed === false) {
					this._onData.fire(token);
				}

				delete this.current;
				return;
			}

			const { nextParser } = acceptResult;

			if (nextParser instanceof FrontMatterToken) {
				this._onData.fire(nextParser);

				if (wasTokenConsumed === false) {
					this._onData.fire(token);
				}

				delete this.current;
				return;
			}

			this.current = nextParser;
			if (wasTokenConsumed === false) {
				this._onData.fire(token);
			}

			return;
		}

		// TODO: @legomushroom - add other tokens?
		// TODO: @legomushroom - reuse common constant with the tokens list
		if ((token instanceof Space) || (token instanceof Tab) || (token instanceof CarriageReturn) || (token instanceof NewLine)) {
			this._onData.fire(token);
			return;
		}

		// TODO: @legomushroom - reuse common list of tokens
		if (token instanceof Word) {
			this.current = new PartialFrontMatterRecordName(token);
			return;
		}

		// unexpected token type, re-emit existing tokens and continue
		// TODO: @legomushroom - fire an error event?
		this.reEmitCurrentTokens();
	}

	protected override onStreamEnd(): void {
		try {
			if (this.current === undefined) {
				return;
			}

			// TODO: @legomushroom - fire an error event?
			this.reEmitCurrentTokens();
		} finally {
			delete this.current;
			super.onStreamEnd();
		}
	}

	/**
	 * Re-emit tokens accumulated so far in the current parser object.
	 */
	protected reEmitCurrentTokens(): void {
		if (this.current === undefined) {
			return;
		}

		for (const token of this.current.tokens) {
			this._onData.fire(token);
		}
		delete this.current;
	}
}
