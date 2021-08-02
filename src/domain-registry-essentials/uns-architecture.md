---
description: >-
  This section provides a high-level overview of UNS — Universal Name Service.
  Readers should have a basic understanding of Ethereum smart contracts and the
  ERC-721 token standard.
---

# UNS Architecture

Every UNS domain is issued as an[ ERC-721](https://eips.ethereum.org/EIPS/eip-721) token. Building on this standard makes it easier for developers to integrate with Unstoppable Domains and it lets users manage their domain ownership from any compatible wallet, exchange, or marketplace.

This page covers the following topics:

* ​[Smart contract architecture](uns-architecture.md#smart-contract-architecture) — An overview of the core smart contracts that make up UNS. This section explains how domains are minted and managed, what domain information is stored, and how users can interact with those domains through a blockchain.
* ​[Domain hierarchy and ownership](uns-architecture.md#domain-hierarchy-and-ownership) — Explains how domains can be structured, created, and managed.
* ​[Delegating domain management](uns-architecture.md#delegating-domain-management) — Explains the role of the transaction processor and meta transactions in minting domains and allowing users to delegate transaction costs.

UNS is built by Unstoppable Domains, which includes a new registry and set of new smart contracts. The structure is similar to CNS in that domains are owned **irrevocably**. Domains do not need to be renewed and cannot be reclaimed by Unstoppable Domains. Once claimed, users have complete control of their domains.

## Smart Contract Architecture

UNS has one single smart contract, the `Registry`. The same `Registry` contract is used for managing domain ownership and storing domain records. `Records Storage` is responsible for storing domain records.

![Registry and RecordStorage interaction](../.gitbook/assets/uns-architecture.png)

Each ERC-721 token can be identified by a unique number, its `tokenId`. To make domains identifiable, we use a process called [Namehashing](namehashing.md).

 For instance, `example.wallet`'s namehash: `0xbb71ef26b78e4f38d71c609a577bf259ee5dfd9bd242928598f094c4ad1ebe70`

### Registry

`Registry` is the most essential smart contract in UNS. This is the contract that defines ownership rules, how domains are minted, provides[ ERC-721 token metadata](https://docs.openzeppelin.com/contracts/2.x/api/token/erc721#IERC721Metadata), and stores a metadata-enriched list of all domains. This is where domain owners store their data, such as cryptocurrency addresses, chat IDs, and IPFS hashes for decentralized websites.

Under the surface, `Registry` is effectively a map of domain namehashes to key-value dictionaries of records. This structure allows users to store arbitrary records, even those that aren't specified by the[ Records reference](https://docs.unstoppabledomains.com/domain-registry-essentials/records-reference).

`Registry` stores:

* Owner address
* Approved operator address
* Domain records

`Registry`'s smart contract includes a set of methods for minting new domains and managing ownership.

Accounts that are allowed to mint second-level domains \(e.g.: `alice.x`\) are called whitelisted minters. Whitelisted minters are only permitted to mint new domains. They can't control domain ownership \(e.g. approve or transfer a domain to another owner\) and they can't change domain records. Whitelisted minters are operated by Unstoppable Domains.

`Registry`'s smart contract was designed without an admin. This means that no entity can manage or transfer a user's domains without their permission — even Unstoppable Domains.

Domain owners can:

* Transfer domain ownership
* Set domain records
* Burn a domain

Domain owners can set one Approved address per domain and many Operator addresses. These roles can manage a domain on a user's behalf. For more details, see [Managing domain ownership](../allow-my-users-to-manage-existing-domains/managing-domain-ownership.md).

### ProxyReader

`ProxyReader` is a smart contract that our[ resolution libraries](https://github.com/unstoppabledomains?q=resolution) use to resolve domains. It supports CNS and UNS domains, so users won’t need to search for a specific proxy reader. Users can use the latest `ProxyReader` version to resolve all domains.

For more information on how the resolution process works read [Resolving domain records](resolving-domain-records.md).

## Domain Hierarchy and Ownership

A domain can be owned by both an external address \(one that is accessed with a private key\) or an internal address \(i.e.: a smart contract\). Managing domains with smart contracts opens up many new ways to structure ownership. For example, domain management could be governed by a multi-signature wallet or it could be equally shared among a group of administrators. These are two simple examples but there are many more possibilities.

Such an ownership model might not be suitable for every user. Someone could allow writing to their domain records, but only to a restricted set of records, without giving permission to transfer domain. This could be achieved by using an intermediate smart contract. Twitter verification works in this way, and the best example is the [TwitterValidationOperator contract](https://github.com/unstoppabledomains/uns/blob/main/contracts/operators/TwitterValidationOperator.sol).

{% hint style="info" %}
If the owner of a `.wallet` top-level domain is set to a[ burn address](https://etherscan.io/address/0x000000000000000000000000000000000000dEaD), that means that only direct owners can transfer or burn their second-level domains. To mint second-level domains we use a different mechanism, which doesn't rely on domain ownership. For more information, see the Minting  subsection of [Delegating Domain Management](uns-architecture.md#delegating-domain-management).
{% endhint %}

### Alternative Ownership Models

External smart contracts exist for UNS. Domains can be owned by smart contracts, and users can implement any permission model, such as a complex ownership permission model if defined by a smart contract's set of methods.

## Delegating Domain Management

UNS allows users to delegate transaction execution to accounts that aren't domain owners by supporting [EIP-2771 - Secure Protocol for Native Meta Transactions](https://eips.ethereum.org/EIPS/eip-2771).

`Registry` smart contracts implement methods that use [Meta Transactions](../allow-my-users-to-manage-existing-domains/meta-transactions.md). One use-case for meta transactions is delegating \(gas-using\) blockchain calls to other accounts. This allows domain owners to keep their domains and funds on separate accounts or even have someone else pay their transaction fees.

Unstoppable Domains uses this delegation feature to operate an internal transaction processor. Our transaction processor makes it possible for users to mint and manage their domains without having to worry about their wallet's balance. Under the hood, the transaction processor is a queue-based job processor that sends transactions from Unstoppable Domains-owned accounts.

On behalf of our users, our transaction processor generally handles:

* Minting domains
* Managing domains \(transferring, modifying records\)

**Minting domains** happens when a user claims a domain from the Unstoppable Domains website. This action doesn't require a domain owner's signature, since the minting of second-level domains is controlled by Unstoppable Domains.

**Managing domains,** in contrast, can only be performed with a domain owner's permission. Each delegated transaction that modifies the owner address or the domain records requires a domain owner's signature.

UNS transaction delegation does not depend on Unstoppable Domains' transaction processor. As long as the domain owner provides a valid signature, write operations can be performed by any Ethereum account.

To learn more about the technical details of delegating transactions in UNS, read our [Meta Transactions](../allow-my-users-to-manage-existing-domains/meta-transactions.md) page.  


  

