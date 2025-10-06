declare var clone: {
    (parent: any, circular?: any, depth?: any, prototype?: any, includeNonEnumerable?: any): any;
    /**
     * Simple flat clone using prototype, accepts only objects, usefull for property
     * override on FLAT configuration object (no nested props).
     *
     * USE WITH CAUTION! This may not behave as you wish if you do not know how this
     * works.
     */
    clonePrototype(parent: any): any;
    __objToStr: (o: any) => string;
    __isDate: (o: any) => boolean;
    __isArray: (o: any) => boolean;
    __isRegExp: (o: any) => boolean;
    __getRegExpFlags: (re: any) => string;
};
export default clone;
