/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { YamlToken } from './yamlToken.js';
import { BaseToken } from '../../baseToken.js';
import { YamlRecord } from '../parsers/yamlRecord.js';

/**
 * TODO: @legomushroom
 */
export class YamlObject extends YamlToken {
	constructor(
		public readonly records: readonly YamlRecord[],
	) {
		const firstRecord = records[0];
		const lastRecord = records[records.length - 1];

		super(BaseToken.fullRange([firstRecord, lastRecord]));
	}

	public override get text(): string {
		return BaseToken.render(this.records);
	}

	public override toString(): string {
		return `yaml-obj(${this.shortText()}){${this.range}}`;
	}
}
