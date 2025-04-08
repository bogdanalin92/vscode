/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Range } from '../../../common/core/range.js';
import { TestDecoder } from '../utils/testDecoder.js';
import { VSBuffer } from '../../../../base/common/buffer.js';
import { newWriteableStream } from '../../../../base/common/stream.js';
import { Word } from '../../../common/codecs/simpleCodec/tokens/word.js';
import { Space } from '../../../common/codecs/simpleCodec/tokens/space.js';
import { Colon } from '../../../common/codecs/simpleCodec/tokens/colon.js';
import { YamlDecoder } from '../../../common/codecs/simpleYamlCodec/yamlDecoder.js';
import { YamlString } from '../../../common/codecs/simpleYamlCodec/tokens/yamlString.js';
import { YamlObject } from '../../../common/codecs/simpleYamlCodec/tokens/yamlObject.js';
import { YamlRecord } from '../../../common/codecs/simpleYamlCodec/parsers/yamlRecord.js';
import { TSimpleDecoderToken } from '../../../common/codecs/simpleCodec/simpleDecoder.js';
import { ensureNoDisposablesAreLeakedInTestSuite } from '../../../../base/test/common/utils.js';

/**
 * TODO: @legomushroom
 */
export class TestYamlDecoder extends TestDecoder<TSimpleDecoderToken, YamlDecoder> {
	constructor() {
		const stream = newWriteableStream<VSBuffer>(null);
		const decoder = new YamlDecoder(stream);

		super(stream, decoder);
	}
}

suite('SimpleYamlDecoder', () => {
	const disposables = ensureNoDisposablesAreLeakedInTestSuite();

	suite('string', () => {
		test('produces expected tokens', async () => {
			const test = disposables.add(
				new TestYamlDecoder(),
			);

			await test.run(
				[
					'just write some yaml',
				],
				[
					// first line
					YamlString.fromTokens([
						new Word(new Range(1, 1, 1, 1 + 4), 'just'),
						new Space(new Range(1, 5, 1, 6)),
						new Word(new Range(1, 6, 1, 6 + 5), 'write'),
						new Space(new Range(1, 11, 1, 12)),
						new Word(new Range(1, 12, 1, 12 + 4), 'some'),
						new Space(new Range(1, 16, 1, 17)),
						new Word(new Range(1, 17, 1, 17 + 4), 'yaml'),
					]),
					// second line
				],
			);
		});
	});

	suite('object', () => {
		test('produces expected tokens', async () => {
			const test = disposables.add(
				new TestYamlDecoder(),
			);

			await test.run(
				[
					'just: write some yaml ',
					// 'just write: some yaml',
					// 'right here: or there',
				],
				[
					// first line
					new YamlObject(
						[
							YamlRecord.fromTokens(
								YamlString.fromTokens([
									new Word(new Range(1, 1, 1, 1 + 4), 'just'),
								]),
								[
									new Colon(new Range(1, 5, 1, 6)),
									new Space(new Range(1, 6, 1, 7)),
								],
								YamlString.fromTokens([
									new Word(new Range(1, 7, 1, 7 + 15), 'write some yaml '),
									new Space(new Range(1, 22, 1, 23)),
								]),
							),
						],
					),
				],
			);
		});
	});
});
