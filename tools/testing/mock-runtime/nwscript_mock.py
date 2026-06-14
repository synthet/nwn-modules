"""
Lightweight NWScript mock runtime for unit-style testing.

Does NOT emulate the full Aurora engine. Provides deterministic stubs
for common NWScript API functions so pure logic functions can be tested
without a live NWN server.

Usage:
    import sys, os
    sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'mock-runtime'))
    import nwscript_mock as nwn

    nwn.reset_state()
    pc = nwn.setup_pc(tag="test_pc", name="Test Player")
    nwn.SetLocalInt(pc, "q_state", 2)
    assert nwn.GetLocalInt(pc, "q_state") == 2
"""

from __future__ import annotations
from typing import Callable, List, Dict, Optional


# ---------------------------------------------------------------------------
# Core object model
# ---------------------------------------------------------------------------

class NWObject:
    """Minimal stand-in for a NWN engine object."""

    _next_id: int = 1

    def __init__(self, tag: str = "", name: str = "", valid: bool = True) -> None:
        self._id: int = NWObject._next_id
        NWObject._next_id += 1
        self._tag: str = tag
        self._name: str = name
        self._valid: bool = valid
        self._local_ints: Dict[str, int] = {}
        self._local_strings: Dict[str, str] = {}
        self._local_floats: Dict[str, float] = {}

    def __repr__(self) -> str:
        status = "valid" if self._valid else "INVALID"
        return f"<NWObject id={self._id} tag={self._tag!r} {status}>"


# Singleton representing OBJECT_INVALID
OBJECT_INVALID = NWObject(tag="", name="", valid=False)
OBJECT_INVALID._id = 0


# ---------------------------------------------------------------------------
# Module-level state
# ---------------------------------------------------------------------------

_current_module: Optional[NWObject] = None
_pc_speaker: Optional[NWObject] = None
_first_pc: Optional[NWObject] = None
_entering_object: Optional[NWObject] = None
_exiting_object: Optional[NWObject] = None
_messages_log: List[str] = []
_assign_log: List[str] = []


def reset_state() -> None:
    """Clear all mock state. Call this in setUp() to prevent test leakage."""
    global _current_module, _pc_speaker, _first_pc
    global _entering_object, _exiting_object, _messages_log, _assign_log

    _current_module = NWObject(tag="MODULE", name="Module")
    _pc_speaker = None
    _first_pc = None
    _entering_object = None
    _exiting_object = None
    _messages_log = []
    _assign_log = []


def setup_pc(tag: str = "test_pc", name: str = "Test Player") -> NWObject:
    """Create a PC object and register it as pc_speaker and first_pc."""
    global _pc_speaker, _first_pc
    pc = NWObject(tag=tag, name=name, valid=True)
    _pc_speaker = pc
    _first_pc = pc
    return pc


def setup_entering_object(tag: str = "test_enter", name: str = "") -> NWObject:
    """Create an NWObject and set it as the entering object (for OnClientEnter tests)."""
    global _entering_object
    obj = NWObject(tag=tag, name=name, valid=True)
    _entering_object = obj
    return obj


def setup_exiting_object(tag: str = "test_exit", name: str = "") -> NWObject:
    """Create an NWObject and set it as the exiting object."""
    global _exiting_object
    obj = NWObject(tag=tag, name=name, valid=True)
    _exiting_object = obj
    return obj


# ---------------------------------------------------------------------------
# NWScript API stubs
# ---------------------------------------------------------------------------

def GetIsObjectValid(obj: NWObject) -> int:
    """Returns 1 if the object is valid, 0 otherwise (mirrors NWScript TRUE/FALSE)."""
    if not isinstance(obj, NWObject):
        return 0
    return 1 if obj._valid else 0


def GetPCSpeaker() -> NWObject:
    """Returns the current PC speaker in a conversation, or OBJECT_INVALID."""
    return _pc_speaker if _pc_speaker is not None else OBJECT_INVALID


def GetFirstPC() -> NWObject:
    """Returns the first PC in the module, or OBJECT_INVALID."""
    return _first_pc if _first_pc is not None else OBJECT_INVALID


def GetEnteringObject() -> NWObject:
    """Returns the object that triggered an OnEnter event, or OBJECT_INVALID."""
    return _entering_object if _entering_object is not None else OBJECT_INVALID


def GetExitingObject() -> NWObject:
    """Returns the object that triggered an OnExit event, or OBJECT_INVALID."""
    return _exiting_object if _exiting_object is not None else OBJECT_INVALID


def GetModule() -> NWObject:
    """Returns the module object."""
    global _current_module
    if _current_module is None:
        _current_module = NWObject(tag="MODULE", name="Module")
    return _current_module


def GetArea(obj: NWObject) -> NWObject:
    """Returns the area containing obj. Always returns OBJECT_INVALID in the mock."""
    return OBJECT_INVALID


def GetTag(obj: NWObject) -> str:
    """Returns the tag of an object, or "" if invalid."""
    if not isinstance(obj, NWObject) or not obj._valid:
        return ""
    return obj._tag


def GetName(obj: NWObject) -> str:
    """Returns the name of an object, or "" if invalid."""
    if not isinstance(obj, NWObject) or not obj._valid:
        return ""
    return obj._name


# --- Local integer variables ---

def GetLocalInt(obj: NWObject, sVarName: str) -> int:
    """Returns the local int variable on obj, or 0 if not set or obj is invalid."""
    if not isinstance(obj, NWObject) or not obj._valid:
        return 0
    return obj._local_ints.get(sVarName, 0)


def SetLocalInt(obj: NWObject, sVarName: str, nValue: int) -> None:
    """Sets a local int variable on obj. No-op if obj is invalid."""
    if not isinstance(obj, NWObject) or not obj._valid:
        return
    obj._local_ints[sVarName] = int(nValue)


def DeleteLocalInt(obj: NWObject, sVarName: str) -> None:
    """Deletes a local int variable. No-op if not set or obj is invalid."""
    if not isinstance(obj, NWObject) or not obj._valid:
        return
    obj._local_ints.pop(sVarName, None)


# --- Local string variables ---

def GetLocalString(obj: NWObject, sVarName: str) -> str:
    """Returns the local string variable on obj, or "" if not set or obj is invalid."""
    if not isinstance(obj, NWObject) or not obj._valid:
        return ""
    return obj._local_strings.get(sVarName, "")


def SetLocalString(obj: NWObject, sVarName: str, sValue: str) -> None:
    """Sets a local string variable on obj. No-op if obj is invalid."""
    if not isinstance(obj, NWObject) or not obj._valid:
        return
    obj._local_strings[sVarName] = str(sValue)


def DeleteLocalString(obj: NWObject, sVarName: str) -> None:
    """Deletes a local string variable. No-op if not set or obj is invalid."""
    if not isinstance(obj, NWObject) or not obj._valid:
        return
    obj._local_strings.pop(sVarName, None)


# --- Local float variables ---

def GetLocalFloat(obj: NWObject, sVarName: str) -> float:
    """Returns the local float variable on obj, or 0.0 if not set or obj is invalid."""
    if not isinstance(obj, NWObject) or not obj._valid:
        return 0.0
    return obj._local_floats.get(sVarName, 0.0)


def SetLocalFloat(obj: NWObject, sVarName: str, fValue: float) -> None:
    """Sets a local float variable on obj. No-op if obj is invalid."""
    if not isinstance(obj, NWObject) or not obj._valid:
        return
    obj._local_floats[sVarName] = float(fValue)


def DeleteLocalFloat(obj: NWObject, sVarName: str) -> None:
    """Deletes a local float variable. No-op if not set or obj is invalid."""
    if not isinstance(obj, NWObject) or not obj._valid:
        return
    obj._local_floats.pop(sVarName, None)


# --- Messaging ---

def SendMessageToPC(oPC: NWObject, sMessage: str) -> None:
    """Appends a message to the log (simulates sending text to a player client)."""
    _messages_log.append(str(sMessage))


# --- Action queue stubs ---

def AssignCommand(obj: NWObject, action: Callable) -> None:
    """Stub: logs that a command was assigned. Does not execute the action."""
    desc = getattr(action, "__name__", repr(action))
    _assign_log.append(f"AssignCommand({obj}, {desc})")


def DelayCommand(fSeconds: float, action: Callable) -> None:
    """Stub: executes action immediately (no real delay in unit tests)."""
    action()


# --- Object creation/destruction ---

def CreateObject(
    nObjectType: int,
    sTemplate: str,
    lLocation: object = None,
    bUseAppearAnimation: int = 0,
    sNewTag: str = "",
) -> NWObject:
    """
    Returns a new mock NWObject. nObjectType and lLocation are accepted but ignored.
    If sNewTag is provided it becomes the object's tag; otherwise sTemplate is used.
    """
    tag = sNewTag if sNewTag else sTemplate
    return NWObject(tag=tag, name=sTemplate, valid=True)


def DestroyObject(oObject: NWObject, fDelay: float = 0.0) -> None:
    """Marks the object as invalid (simulates engine destruction)."""
    if isinstance(oObject, NWObject):
        oObject._valid = False


# ---------------------------------------------------------------------------
# Helper functions (NOT part of the NWScript API)
# ---------------------------------------------------------------------------

def get_messages() -> List[str]:
    """Return all messages captured by SendMessageToPC since last reset or clear."""
    return list(_messages_log)


def clear_messages() -> None:
    """Clear the SendMessageToPC message log."""
    _messages_log.clear()


def get_assign_log() -> List[str]:
    """Return all AssignCommand log entries since last reset."""
    return list(_assign_log)


# ---------------------------------------------------------------------------
# Initialise state on import
# ---------------------------------------------------------------------------

reset_state()
