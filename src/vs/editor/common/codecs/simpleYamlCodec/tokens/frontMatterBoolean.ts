/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { FrontMatterValueToken } from './frontMatterToken.js';
import { Range } from '../../../../../editor/common/core/range.js';

/**
 * TODO: @legomushroom
 */
export class FrontMatterBoolean extends FrontMatterValueToken {
	constructor(
		range: Range,
		public readonly value: boolean,
	) {
		super(range);
	}

	public override get text(): string {
		return `${this.value}`;
	}
	public override toString(): string {
		return `front-matter-boolean(${this.shortText()})${this.range}`;
	}
}
