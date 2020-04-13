export function convertDocs<T>(docs) {
  return docs.map(doc => {
    return {
      id: doc.id,
      ...doc.data()
    };
  }) as T[];
}

export function convertSnaps<T>(snaps) {
  return snaps.map(snap => {
    return {
      id: snap.payload.doc.id,
      ...snap.payload.doc.data()
    };
  }) as T[];
}

export function convertSnap<T>(snap) {
  if (snap.payload.exists) {
    return ({
      id: snap.payload.id,
      ...snap.payload.data()
    }) as T;
  } else {
    return null;
  }
}
