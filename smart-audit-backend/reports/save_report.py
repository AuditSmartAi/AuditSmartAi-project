from reports.save_minting_report import save_minting_report

# Call the function
mintingResults = {
    "metadata": {
        "name": "Audit NFT #1",
        "description": "A verified smart contract audit certificate.",
        "image": "https://example.com/nft.png"
    },
    "token_id": "12345",
    "token_uri": "https://ipfs.io/ipfs/example",
    "nft_contract": "0xABCDEF...",
    "transaction_hash": "0xTXHASH...",
    "block_number": 12345678,
    "gas_used": 21000,
    "recipient": "0xUserAddress..."
}
save_minting_report(mintingResults)

