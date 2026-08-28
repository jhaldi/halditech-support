---
title: "Bamboo HR Integration"
slug: "bamboo-hr-integration"
tags: [Integrations, BambooHR]
summary: "How the BambooHR integration syncs driver records and PTO requests into HaldiTech, and how to configure the key and tenant."
freshdesk_id: 150000198217
---

# Bamboo HR Integration

Here is a summary of what the Bamboo HR integration does.

1. Every 5 minutes, HaldiTech pulls all driver records from Bamboo.

2. We attempt to match the Bamboo Driver record with the HaldiTech Driver record using the **Driver Number** field configured in integration settings for the Bamboo API. Bamboo stores the FedEx driver number in different fields for different contractors, depending on how the contractor sets up their instance of Bamboo.

   For example, XYC Logistics uses field #636 to store the FedEx driver number in Bamboo.

3. If there's a match, the API will update the first and last name. It'll update the phone number if that's set in the integration settings, and it'll add the email address for the driver if HaldiTech is blank.

4. If turned on in integration settings, it will also insert and update PTO requests, including the status of the request — so if a manager approves a request in Bamboo, that approval will show in HaldiTech too. It'll also insert notes from Bamboo leave requests into HT if there are any.

The **Tenant** is how you access Bamboo. For example, if XYC Logistics gets to Bamboo with the URL xyzlogistics.bamboo.com, then the tenant field in integration settings should be "xyzlogistics".

To get the proper FedEx Driver Number field, any TSP using Bamboo should set up the key and the tenant, then have HT Support inspect the raw results returned from the API to find the field number used for the FedEx driver number. (And of course, you'll need to have that Driver Number field set up and populated in Bamboo somewhere.)
