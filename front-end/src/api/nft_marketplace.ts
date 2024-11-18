/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/nft_marketplace.json`.
 */
export type NftMarketplace = {
  "address": "hPd5fM2UuWmU36aE1Cx3HmhScY9fWFswVwe53R2HWZs",
  "metadata": {
    "name": "nftMarketplace",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "buyNft",
      "discriminator": [
        96,
        0,
        28,
        190,
        49,
        107,
        83,
        222
      ],
      "accounts": [
        {
          "name": "buyer",
          "writable": true,
          "signer": true
        },
        {
          "name": "seller",
          "writable": true
        },
        {
          "name": "mint",
          "writable": true
        },
        {
          "name": "nftListingAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  76,
                  73,
                  83,
                  84,
                  69,
                  68,
                  95,
                  78,
                  70,
                  84,
                  95,
                  69,
                  77,
                  83,
                  75,
                  73,
                  81,
                  95,
                  83,
                  69,
                  69,
                  68
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "pdaTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "programPda"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "buyerTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "buyer"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "programPda",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  78,
                  70,
                  84,
                  95,
                  77,
                  65,
                  82,
                  75,
                  69,
                  84,
                  80,
                  76,
                  65,
                  67,
                  69,
                  95,
                  69,
                  77,
                  83,
                  75,
                  73,
                  81
                ]
              }
            ]
          }
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "createMetadata",
      "discriminator": [
        30,
        35,
        117,
        134,
        196,
        139,
        44,
        25
      ],
      "accounts": [
        {
          "name": "mint",
          "writable": true,
          "signer": true
        },
        {
          "name": "mintAuthority",
          "writable": true,
          "signer": true
        },
        {
          "name": "metadata",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  101,
                  116,
                  97,
                  100,
                  97,
                  116,
                  97
                ]
              },
              {
                "kind": "account",
                "path": "tokenMetadataProgram"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "account",
              "path": "tokenMetadataProgram"
            }
          }
        },
        {
          "name": "masterEdition",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  101,
                  116,
                  97,
                  100,
                  97,
                  116,
                  97
                ]
              },
              {
                "kind": "account",
                "path": "tokenMetadataProgram"
              },
              {
                "kind": "account",
                "path": "mint"
              },
              {
                "kind": "const",
                "value": [
                  101,
                  100,
                  105,
                  116,
                  105,
                  111,
                  110
                ]
              }
            ],
            "program": {
              "kind": "account",
              "path": "tokenMetadataProgram"
            }
          }
        },
        {
          "name": "tokenMetadataProgram",
          "address": "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "title",
          "type": "string"
        },
        {
          "name": "uri",
          "type": "string"
        }
      ]
    },
    {
      "name": "listNft",
      "discriminator": [
        88,
        221,
        93,
        166,
        63,
        220,
        106,
        232
      ],
      "accounts": [
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "mint",
          "writable": true
        },
        {
          "name": "ownerTokenAccount",
          "writable": true
        },
        {
          "name": "nftListingAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  76,
                  73,
                  83,
                  84,
                  69,
                  68,
                  95,
                  78,
                  70,
                  84,
                  95,
                  69,
                  77,
                  83,
                  75,
                  73,
                  81,
                  95,
                  83,
                  69,
                  69,
                  68
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "pdaTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "programPda"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "programPda",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  78,
                  70,
                  84,
                  95,
                  77,
                  65,
                  82,
                  75,
                  69,
                  84,
                  80,
                  76,
                  65,
                  67,
                  69,
                  95,
                  69,
                  77,
                  83,
                  75,
                  73,
                  81
                ]
              }
            ]
          }
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "price",
          "type": "u64"
        }
      ]
    },
    {
      "name": "mint",
      "discriminator": [
        51,
        57,
        225,
        47,
        182,
        146,
        137,
        166
      ],
      "accounts": [
        {
          "name": "mint",
          "writable": true,
          "signer": true
        },
        {
          "name": "mintAuthority",
          "writable": true,
          "signer": true
        },
        {
          "name": "tokenAccount",
          "writable": true
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "listedNft",
      "discriminator": [
        217,
        185,
        19,
        110,
        217,
        15,
        75,
        240
      ]
    }
  ],
  "events": [
    {
      "name": "metadataCreatedEvent",
      "discriminator": [
        235,
        97,
        83,
        69,
        72,
        24,
        144,
        69
      ]
    },
    {
      "name": "mintSucessfulEvent",
      "discriminator": [
        213,
        219,
        124,
        50,
        114,
        110,
        101,
        33
      ]
    },
    {
      "name": "nftSoldEvent",
      "discriminator": [
        86,
        78,
        4,
        84,
        22,
        50,
        236,
        71
      ]
    },
    {
      "name": "nftListedEvent",
      "discriminator": [
        209,
        171,
        3,
        47,
        191,
        120,
        133,
        103
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "insufficientFunds",
      "msg": "Insufficient funds to purchase the NFT."
    }
  ],
  "types": [
    {
      "name": "listedNft",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "price",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "metadataCreatedEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "mint",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "mintSucessfulEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "marketplace",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "nftSoldEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "seller",
            "type": "pubkey"
          },
          {
            "name": "buyer",
            "type": "pubkey"
          },
          {
            "name": "marketplace",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "nftListedEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "nft",
            "type": "pubkey"
          },
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "marketplace",
            "type": "pubkey"
          },
          {
            "name": "price",
            "type": "u64"
          }
        ]
      }
    }
  ]
};
