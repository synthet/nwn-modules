# Modern NWN:EE Persistent World Project Design

This document turns the starter Aurora/Nasher module into a practical roadmap for a maintainable Neverwinter Nights: Enhanced Edition persistent-world-ready project. It assumes a solo developer or small team that wants to build a polished fantasy adventure module first, then grow it into a live PW.

## Goals and constraints

- Target **Neverwinter Nights: Enhanced Edition**, not NWN2.
- Keep the **Aurora Toolset** as the primary authoring environment for visual/module content.
- Keep **Nasher source in Git** as the reviewable source of truth.
- Prefer **Linux server deployment** for multiplayer and NWNX.
- Prefer open-source or community-standard tools.
- Keep early gameplay playable without NWNX so the module can be tested locally.
- Version custom content, database migrations, deployment configuration, and documentation alongside scripts.

## Recommended toolchain

| Area | Required baseline | Optional / later | Notes |
|---|---|---|---|
| Module authoring | Aurora Toolset | NWN Explorer Reborn | Toolset remains canonical for areas, conversations, palettes, blueprints, journals, and module properties. |
| Source control | Git + GitHub/GitLab | protected branches, PR templates | Commit Nasher source, not generated binaries as day-to-day source. |
| Module build | Nasher | CI artifact upload | Build `.mod`, `.hak`, and `.tlk` artifacts repeatably from source. |
| Script editing | VS Code | NWScript language server | Avoid the Toolset script editor for non-trivial systems. |
| Script compilation | neverwinter.nim / `nwn_script_comp` or `nwnsc` | CI compile checks | Compile before packaging and before staging deploys. |
| Server runtime | NWN:EE dedicated server | Docker Compose | Required once multiplayer testing begins. |
| PW extensions | NWNX:EE | Redis, metrics plugins | Hide NWNX calls behind wrapper includes. |
| Persistence | PostgreSQL | SQLite for local prototypes | Use PostgreSQL for any serious public PW. |
| Custom content | HAK + TLK + NWSync | Caddy/nginx/CDN | Prefer NWSync for public player onboarding. |
| Operations | systemd + backups + logs | Prometheus/Grafana, Loki, Uptime Kuma | Treat the PW as a small live service. |

## Architecture overview

```text
Developer workstation
  Aurora Toolset
  VS Code + NWScript language support
  Nasher + script compiler
        |
        v
Git repository
  src/module, src/areas, src/scripts, src/blueprints, src/dialogs
  src/2da, src/tlk, art, docs, tools, database, docker
        |
        v
Build pipeline
  compile scripts -> pack module/haks/tlk -> publish NWSync -> archive release
        |
        +--------------------+
        |                    |
        v                    v
Staging server          Production server
  NWN:EE/NWNX             NWN:EE/NWNX
  staging DB              production DB
  staging NWSync          production NWSync
  test passwords          public access
```

## Repository structure target

The current repository already has the core `src/`, `art/`, `docs/`, `tools/`, `build/dist/`, and `nasher.cfg` layout. As the module matures, extend it toward this shape:

```text
nwn-modules/
  README.md
  nasher.cfg
  docs/
    design/
      persistent-world-project.md
      toolchain.md
      database.md
      custom-content.md
      server-operations.md
    release-notes/
  src/
    module/
    areas/
    scripts/
      include/
        core/
        db/
        systems/
      events/
      quests/
      admin/
    blueprints/
      creatures/
      items/
      placeables/
      doors/
      encounters/
      merchants/
    dialogs/
    2da/
    tlk/
  art/
    blender/
    textures/
    exports/
  database/
    migrations/
    seeds/
    docs/
  docker/
    docker-compose.yml
    docker-compose.staging.yml
    docker-compose.prod.yml
    Caddyfile
    env.example
  tools/
    README.md
    build.sh
    compile-scripts.sh
    pack.sh
    smoke-test.sh
```

## Module scripting architecture

Use thin event scripts and route work into modular systems.

```text
Module OnLoad
  -> Bootstrap_Init()
     -> Logging_Init()
     -> Config_Load()
     -> DB_CheckAvailability()
     -> Systems_Register()

Module OnClientEnter
  -> Event_DispatchClientEnter(oPC)
     -> Login_OnEnter(oPC)
     -> Validation_OnEnter(oPC)
     -> Quest_OnEnter(oPC)
     -> Faction_OnEnter(oPC)
     -> Admin_OnEnter(oPC)

Module OnClientLeave
  -> Session_Save(oPC)
  -> Audit_LogLogout(oPC)
```

Recommended script prefixes:

- `inc_*`: shared constants and utilities.
- `db_*`: database repository wrappers.
- `sys_*`: gameplay systems.
- `evt_*`: event dispatch helpers.
- `qst_*`: quest-specific logic.
- `adm_*`: DM/admin tools.
- `plc_*`, `cre_*`, `trg_*`: object-specific scripts.

Avoid monolithic event scripts, expensive heartbeats, raw SQL in gameplay scripts, and hidden side effects in include files.

## Persistent systems roadmap

### Phase 1: PW-ready local module

- One starter area, one wilderness route, one dungeon, one quest chain.
- Basic rest/death/respawn rules.
- Basic loot and merchant behavior.
- Nasher build workflow.
- Script compile checks.
- No hard dependency on NWNX or a database.

### Phase 2: private multiplayer test server

- Dedicated server on Linux.
- Passworded staging-style environment.
- Logging and automatic restart.
- Basic DM wand or admin conversation.
- Clean-client custom-content test.

### Phase 3: database-backed persistence

- NWNX:EE enabled server.
- PostgreSQL schema and migrations.
- Account and character metadata.
- Quest state, reputation, audit logs.
- Basic persistent storage.
- Backup and restore procedure.

### Phase 4: public PW launch

- Production NWSync hosting.
- Rules, Discord/community hub, staff policy.
- Monitoring, backups, staged deployments.
- Anti-exploit checks and admin audit tools.
- Release tags and rollback plan.

### Phase 5: live operations

- Housing, guilds, advanced crafting, player economy.
- Seasonal content pipeline.
- Analytics and balance review.
- Staff onboarding docs.
- Regular restore drills and release retrospectives.

## Database design outline

Start with PostgreSQL once the module reaches Phase 3. Keep migrations in `database/migrations/` and never edit deployed migrations in place.

Core tables to add first:

```text
accounts
  id, public_cdkey_hash, player_name, first_seen_at, last_seen_at, is_banned, ban_reason

characters
  id, account_id, bic_filename, character_name, created_at, last_seen_at, level, is_retired

character_quest_state
  character_id, quest_id, state, progress_json, updated_at

factions
  id, display_name, description

character_reputation
  character_id, faction_id, reputation, rank, updated_at

audit_log
  id, actor_account_id, actor_character_id, actor_dm_name, action, target_type, target_id, details_json, created_at
```

Add later when gameplay requires it:

- `storage_containers` and `storage_items`.
- `houses` and `house_permissions`.
- `guilds`, `guild_members`, and `guild_audit_log`.
- `economy_wallets` and `economy_transactions`.
- `crafting_recipes`, `character_crafting`, and `crafting_attempts`.
- `cooldowns` for lockouts, daily rewards, boss timers, and repeatable quests.

Persistence rules:

- Use local variables for transient session/combat state.
- Use the database for anything that must survive reboot, crash, or character transfer.
- Log all staff actions, rare drops, important item movement, and economy transfers.
- Never scatter raw SQL throughout quest or object scripts.

## Custom content workflow

1. Keep source art in `art/blender/` and `art/textures/`.
2. Export game-ready assets to `art/exports/`.
3. Keep project-specific 2DA rows in `src/2da/`.
4. Pack content into haks with Nasher.
5. Keep custom TLK entries stable; treat TLK line numbers as API.
6. Attach haks and tlk to the module.
7. Publish haks/tlk through NWSync for staging first, then production.
8. Test with a clean NWN user directory before public release.

Compatibility risks to track:

- HAK order conflicts.
- 2DA row collisions.
- TLK line renumbering.
- CEP or third-party content version drift.
- NWSync manifest mismatch or stale CDN cache.
- Client build differences.
- NWNX plugin or Docker image changes.

## Build and deployment workflow

### Local development

```sh
git pull
./tools/build.sh
# edit in Aurora Toolset or VS Code
nasher unpack
git diff
./tools/compile-scripts.sh
./tools/pack.sh
# test locally in NWN:EE
git add -p
git commit
```

### Staging deployment

1. Build artifacts from the integration branch.
2. Publish staging NWSync.
3. Apply staging database migrations.
4. Restart staging server.
5. Connect with a clean client.
6. Test login, transition, combat, quest progress, loot, death/respawn, database write, and admin tool.
7. Review logs before production promotion.

### Production deployment

1. Announce maintenance.
2. Back up production database, module, haks, tlk, and current NWSync repository.
3. Apply reviewed migrations.
4. Deploy artifacts and publish production NWSync.
5. Restart server.
6. Run smoke tests.
7. Reopen server and monitor logs/player reports.

Rollback requires compatible previous module, haks, tlk, NWSync manifest, and database state. Prefer forward fixes once players have written production data after a migration.

## Admin and DM tools

Build these before public launch:

- Authorized DM control item or conversation menu.
- Player and character lookup.
- Teleport, bring, and send-to-safe-area commands.
- Quest state viewer/editor with audit reason.
- Reputation viewer/editor with audit reason.
- Economy balance and transaction viewer.
- Persistent storage inspector.
- Announcement and restart countdown tools.
- Maintenance-mode toggle.
- Recent audit-log viewer.

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| Building too much before the core loop is fun | Start with one town, one route, one dungeon, and one quest chain. |
| Treating `.mod` as the source of truth | Use Nasher source and commit reviewable files. |
| Database overengineering | Add persistence only when the gameplay system exists. |
| Custom content bloat | Start with minimal haks and NWSync-test every release. |
| HAK/2DA conflicts | Reserve rows, document hak order, and centralize merged 2DAs. |
| NWNX lock-in | Wrap NWNX calls and keep early systems locally testable. |
| Poor observability | Add structured logs, audit tables, and DM inspection tools. |
| Economy exploits | Use transaction logs, sinks, conservative rewards, and rare-drop audits. |

## Community resources

- NWN Lexicon: <https://nwnlexicon.com/Main_Page>
- Nasher: <https://github.com/squattingmonk/nasher.nim>
- NWNX:EE documentation: <https://nwnxee.github.io/unified/>
- NWNX:EE repository: <https://github.com/nwnxee/unified>
- neverwinter.nim: <https://github.com/niv/neverwinter.nim>
- Beamdog NWN forums: <https://forums.beamdog.com/categories/neverwinter-nights>
- Neverwinter Vault: <https://neverwintervault.org/>
- CEP 3: <https://neverwintervault.org/project/nwnee/hakpak/combined/cep-3-community-expansion-pack>
- NWN Explorer Reborn: <https://neverwintervault.org/project/nwn1/other/tool/nwn-explorer-reborn>

## Immediate next steps for this repository

- Add `database/` and `docker/` directories when Phase 3 begins.
- Replace illustrative GFF stubs with a real Toolset seed module round-tripped through Nasher.
- Add CI once local `nasher` and compiler commands are stable on contributor machines.
- Add a `CREDITS.md` before accepting third-party or AI-assisted assets.
- Keep release notes tied to exact NWN:EE build, Nasher version, HAK/TLK versions, and database migration number.
