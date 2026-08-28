---
title: "What does \"Estimated\" mean for Third Party Fuel?"
slug: "what-does-estimated-mean-for-third-party-fuel"
tags: [Fuel, Settlements]
summary: "Explains how the wholesale-equivalent price for third-party fuel is matched or estimated, and what the Estimated column means."
freshdesk_id: 150000177209
---

# What does "Estimated" mean for Third Party Fuel?

If the **Estimated** column is false, we're pulling the wholesale equivalent price directly from your FedEx Statement, based on a match of the ticket number from the fuel file and the ticket number reported in the fuel receipts section of the FedEx settlement.

That means we're using the exact wholesale price FedEx uses to calculate your fuel supplement. For Mid-Mile, we match on those most of the time. For other third-party fuel programs, it may fall to the user to manually input those fuel receipts into MyGroundBiz, and that may or may not happen in a timely fashion.

## How we estimate the wholesale equivalent price

As soon as the fuel file finishes importing (as well as right after importing a FedEx Settlement), we go through each line item in the third-party fuel file and look for matches in this order:

a. Match on ticket number in the FedEx settlement fuel receipts section. Estimated = False
b. Match on the combination of city and state on the day of the purchase to find any match in the FedEx fuel receipts from any contractor. Estimated = True
c. Repeat b but using 2 days in either direction. Estimated = True
d. Use only the state to find the match. Estimated = True
e. Repeat d but with 2 days in either direction. Estimated = True
f. Fall back to a global estimate of 7%, which we've derived loosely from the average overall premium we see for all third-party providers. This is not based on enough data to be statistically accurate at this point, but we plan to update it regularly and expect that only a few purchases will fall through to this estimate. Estimated = True
