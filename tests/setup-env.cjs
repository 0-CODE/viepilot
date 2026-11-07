'use strict';
// Tests never install npm dependencies into temporary installed copies (BUG-034): the default
// installer runner honours this flag. Tests of the dependency step inject their own runner.
process.env.VIEPILOT_SKIP_DEPS = '1';
