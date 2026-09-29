"use strict";
/**
 * Types shared by the deterministic local engines.
 *
 * This module deliberately imports nothing — not even from the app — so the
 * engines stay runnable and testable in isolation, and so a change to a UI type
 * can never silently alter engine behaviour.
 */
Object.defineProperty(exports, "__esModule", { value: true });
