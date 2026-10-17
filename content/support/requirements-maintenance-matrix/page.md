---
title: "Requirements + Maintenance Matrix"
slug: "requirements-maintenance-matrix"
tags: [Maintenance, TruckSpy, MileageReports]
summary: "Use the Requirements tab to build preventative-maintenance services that populate the Maintenance Matrix heat map."
freshdesk_id: 150000184778
---

# Requirements

The **Requirements** tab (under **Maintenance**) is where you build the preventative-maintenance services that populate the **Maintenance Matrix**. You can create any requirement you need — DoT inspections, PMs, oil changes, overheads, tires, and so on.

![The Requirements list — service definitions that feed the Matrix](img-1.png)

## Adding a service to the Matrix

In **Requirements**, click **Add**. Choose an existing **Service** or click **+ Add New Service** and give it a **Short Name**. Set **Based On** (miles, time, or both), the **Every** interval, which trucks it **Applies To**, and optional warning/alert emails, then click **Save**.

![The requirement form](img-2.png)

## How the Matrix figures out what's due

The Matrix shows when each truck's next service is due. It's driven by odometer readings pulled from **TruckSpy** or **MileageReports** (shown in the **Source** column). If you don't have either, HaldiTech uses the average miles from your settlements, added to the odometer recorded on the truck's last service visit.
