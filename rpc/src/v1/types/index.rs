// Copyright 2015-2017 Parity Technologies (UK) Ltd.
// This file is part of Parity.

// Parity is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// Parity is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with Parity.  If not, see <http://www.gnu.org/licenses/>.

use serde::{Deserialize, Deserializer, Error};
use serde::de::Visitor;

/// Represents usize.
#[derive(Debug, PartialEq)]
pub struct Index(usize);

impl Index {
	/// Convert to usize
	pub fn value(&self) -> usize {
		self.0
	}
}

impl Deserialize for Index {
	fn deserialize<D>(deserializer: &mut D) -> Result<Index, D::Error>
	where D: Deserializer {
		deserializer.deserialize(IndexVisitor)
	}
}

struct IndexVisitor;

impl Visitor for IndexVisitor {
	type Value = Index;

	fn visit_str<E>(&mut self, value: &str) -> Result<Self::Value, E> where E: Error {
		match value {
			_ if value.starts_with("0x") => usize::from_str_radix(&value[2..], 16).map(Index).map_err(|_| Error::custom("invalid index")),
			_ => value.parse::<usize>().map(Index).map_err(|_| Error::custom("invalid index"))
		}
	}

	fn visit_string<E>(&mut self, value: String) -> Result<Self::Value, E> where E: Error {
		self.visit_str(value.as_ref())
	}
}

#[cfg(test)]
mod tests {
	use super::*;
	use serde_json;

	#[test]
	fn block_number_deserialization() {
		let s = r#"["0xa", "10"]"#;
		let deserialized: Vec<Index> = serde_json::from_str(s).unwrap();
		assert_eq!(deserialized, vec![Index(10), Index(10)]);
	}
}

